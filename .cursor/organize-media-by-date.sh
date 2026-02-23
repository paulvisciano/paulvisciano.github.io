#!/bin/bash
# Organize media files by date (based on file modification time)
# Moves audio/images from a single folder into /memory/raw/YYYY-MM-DD/ structure

set -e

SOURCE_DIR="${1:-.}"  # Source directory (default: current)
TARGET_BASE="${2:-/Users/paulvisciano/Personal/paulvisciano.github.io/memory/raw}"

echo "📁 Media Date Organizer"
echo "======================="
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_BASE"
echo ""

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Process each file in the source directory
count=0
declare -A date_counts

for file in "$SOURCE_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Get file modification date (YYYY-MM-DD format)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            filedate=$(stat -f "%Sm" -t "%Y-%m-%d" "$file")
        else
            # Linux
            filedate=$(date -d @"$(stat -c %Y "$file")" +"%Y-%m-%d")
        fi
        
        # Create target folder
        TARGET_DIR="$TARGET_BASE/$filedate"
        
        # Determine file type (audio or image)
        if [[ "$filename" =~ \.(ogg|mp4|m4a|wav|mp3)$ ]]; then
            TYPE="audio"
        elif [[ "$filename" =~ \.(jpg|png|gif|webp)$ ]]; then
            TYPE="images"
        else
            TYPE="other"
        fi
        
        TYPE_DIR="$TARGET_DIR/$TYPE"
        mkdir -p "$TYPE_DIR"
        
        # Move file
        mv "$file" "$TYPE_DIR/$filename"
        
        # Count by date
        ((date_counts[$filedate]++))
        ((count++))
        
        # Show progress every 50 files
        if [ $((count % 50)) -eq 0 ]; then
            echo "✅ Processed $count files..."
        fi
    fi
done

echo ""
echo "✅ Organized $count files into date folders"
echo ""
echo "Distribution by date:"
for date in "${!date_counts[@]}" | sort; do
    echo "  $date: ${date_counts[$date]} files"
done

echo ""
echo "Structure created:"
ls -lah "$TARGET_BASE" | grep "^d" | awk '{print "  " $NF}'
