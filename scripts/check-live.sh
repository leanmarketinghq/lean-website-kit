#!/bin/bash
# Checks a deployed copy of the site end to end. Read-only: only GET and HEAD requests.
#
#   scripts/check-live.sh https://example.com
#   scripts/check-live.sh https://my-site.my-account.workers.dev
#
# Every line starting with "ok" passed; every "FAIL" needs a look. The script reads
# public/_redirects, so run it from a clone of this repository.
base="${1:?usage: scripts/check-live.sh https://<address>}"
base="${base%/}"
repo="$(cd "$(dirname "$0")/.." && pwd)"   # the repository root, whatever the current directory
get() { curl -s -o /dev/null --max-time 20 -w '%{http_code} %{redirect_url}' "$1"; }

echo "== $base =="

echo "== pages listed in the sitemap =="
sitemap=$(curl -s --max-time 20 "$base/sitemap.xml")
origin=$(echo "$sitemap" | grep -o '<loc>[^<]*</loc>' | head -1 | sed 's/<[^>]*>//g' | sed -E 's#^(https?://[^/]+).*#\1#')
echo "sitemap origin: ${origin:-none found}"
echo "$sitemap" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | while read -r loc; do
  path=${loc#"$origin"}; [ -z "$path" ] && path="/"
  res=$(get "$base$path"); code=${res%% *}
  if [ "$code" = "200" ]; then echo "ok   200 $path"; else echo "FAIL $code $path"; fi
done

echo "== every rule in public/_redirects =="
grep -v '^[[:space:]]*#' "$repo/public/_redirects" | grep -v '^[[:space:]]*$' | while read -r from to status; do
  res=$(get "$base$from"); code=${res%% *}; loc=${res#* }
  expect="$base$to"
  if [ "$code" = "$status" ] && [ "$loc" = "$expect" ]; then echo "ok   $code $from -> $to"; else echo "FAIL $code $from -> '$loc' (expected $status $expect)"; fi
done

echo "== trailing slash / .html variants =="
for p in /index.html /about/ /about.html; do
  res=$(get "$base$p"); echo "$res  <- $p"
done

echo "== unknown address =="
res=$(get "$base/does-not-exist"); echo "status: ${res%% *}"
echo "404 page title: $(curl -s --max-time 20 "$base/does-not-exist" | grep -o '<title>[^<]*</title>')"

echo "== headers on / =="
curl -sI --max-time 20 "$base/" | grep -i -E '^(HTTP|x-robots-tag|x-content-type-options|referrer-policy|permissions-policy|content-type|cache-control):'

echo "== home page content =="
html=$(curl -s --max-time 20 "$base/")
echo "title:      $(echo "$html" | grep -o '<title>[^<]*</title>')"
echo "canonical:  $(echo "$html" | grep -o '<link rel="canonical" href="[^"]*"')"
echo "forms:      $(echo "$html" | grep -c 'widget/form/') GHL iframe(s); lazy: $(echo "$html" | grep -c 'ghl-frame[^>]*loading="lazy"') (want 0)"
echo "GA guard:   $(echo "$html" | grep -o 'location.hostname[^)&]*' | head -1)"

echo "== assets referenced by the home page =="
css=$(echo "$html" | grep -o '/_astro/[^"]*\.css' | sort -u | head -1)
echo "css: $css"
if [ -n "$css" ]; then
  curl -sI --max-time 20 "$base$css" | grep -i -E '^(HTTP|cache-control|content-type):'
  curl -s --max-time 20 "$base$css" | grep -o 'url([^)]*\.woff2[^)]*)' | sed 's/url(//; s/)//; s/"//g' | sort -u | head -4 | while read -r f; do
    f=${f#./}; case "$f" in /*) u="$base$f";; *) u="$base/_astro/$f";; esac
    res=$(get "$u"); echo "font ${res%% *} $f"
  done
fi
echo "$html" | grep -o '<img[^>]*src="[^"]*"' | grep -o 'src="[^"]*"' | sed 's/src="//; s/"//' | sort -u | while read -r img; do
  case "$img" in http*) u="$img";; *) u="$base$img";; esac
  res=$(get "$u"); echo "img  ${res%% *} $img"
done
ogimg=$(echo "$html" | grep -o '<meta property="og:image" content="[^"]*"' | grep -o 'content="[^"]*"' | sed 's/content="//; s/"//')
[ -n "$ogimg" ] && echo "og:image $ogimg -> $(get "${ogimg/$origin/$base}")"

echo "== robots.txt =="
curl -s --max-time 20 "$base/robots.txt"
echo
echo "== done $(date '+%H:%M:%S %Z') =="
