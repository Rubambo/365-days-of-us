#!/bin/bash
SRC="$HOME/Desktop/anaghoose/Photos-1-001"
CSV="$HOME/Desktop/anaghoose/site/manifest.csv"
TMP="$HOME/Desktop/anaghoose/site/manifest_fixed.csv"
> "$TMP"

while IFS=, read -r id date base; do
  if [ "$date" = "<nil>" ]; then
    f="$SRC/$base"
    md=$(mdls -name kMDItemContentCreationDate -raw "$f" 2>/dev/null)
    if [ -z "$md" ] || [ "$md" = "(null)" ]; then
      md=$(mdls -name kMDItemFSCreationDate -raw "$f" 2>/dev/null)
    fi
    if [ -z "$md" ] || [ "$md" = "(null)" ]; then
      new_date=$(stat -f "%Sm" -t "%Y:%m:%d %H:%M:%S" "$f")
    else
      # md format: 2026-07-30 12:51:36 +0000  -> convert to Y:m:d H:M:S
      new_date=$(echo "$md" | awk '{gsub(/-/,":",$1); print $1" "$2}')
    fi
    echo "${id},${new_date},${base}" >> "$TMP"
  else
    echo "${id},${date},${base}" >> "$TMP"
  fi
done < "$CSV"

mv "$TMP" "$CSV"
echo "Fixed. Remaining <nil>:"
grep -c '<nil>' "$CSV" || echo 0
