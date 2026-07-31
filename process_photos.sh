#!/bin/bash
set -e
SRC="$HOME/Desktop/anaghoose/Photos-1-001"
OUT="$HOME/Desktop/anaghoose/site/assets/photos"
CSV="$HOME/Desktop/anaghoose/site/manifest.csv"

mkdir -p "$OUT/full" "$OUT/thumb"
> "$CSV"

i=0
shopt -s nullglob nocaseglob
for f in "$SRC"/*.heic "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png; do
  base=$(basename "$f")
  i=$((i+1))
  id=$(printf "p%04d" "$i")

  # try to get creation date via sips; fallback to file modification time
  date_raw=$(sips -g creation "$f" 2>/dev/null | tail -1 | sed 's/^ *creation: *//')
  if [ -z "$date_raw" ] || [ "$date_raw" = "creation:" ]; then
    date_raw=$(stat -f "%Sm" -t "%Y:%m:%d %H:%M:%S" "$f")
  fi

  sips -s format jpeg -s formatOptions low -Z 1800 "$f" --out "$OUT/full/${id}.jpg" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions low -Z 480 "$f" --out "$OUT/thumb/${id}.jpg" >/dev/null 2>&1

  echo "${id},${date_raw},${base}" >> "$CSV"
  if [ $((i % 25)) -eq 0 ]; then echo "Processed $i..."; fi
done

echo "Done. Total processed: $i"
