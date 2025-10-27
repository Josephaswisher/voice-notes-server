#!/bin/bash
# Generate PWA icons for Voice Notes

ICONS_DIR="public/icons"
SIZES=(72 96 128 144 152 192 384 512)

echo "🎨 Generating PWA icons..."

# Create icons directory
mkdir -p "$ICONS_DIR"

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to generate icons..."

    for size in "${SIZES[@]}"; do
        convert -size ${size}x${size} xc:none \
            -draw "fill #667eea circle $(($size/2)),$(($size/2)) $(($size/2)),5" \
            -draw "fill white font-size $(($size/3)) gravity center text 0,0 '🎙️'" \
            "$ICONS_DIR/icon-${size}x${size}.png"
        echo "✅ Generated $ICONS_DIR/icon-${size}x${size}.png"
    done
else
    echo "ImageMagick not found. Creating SVG-based icons..."

    # Create a base SVG icon
    for size in "${SIZES[@]}"; do
        cat > "$ICONS_DIR/icon-${size}x${size}.svg" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg width="$size" height="$size" viewBox="0 0 $size $size" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
    </defs>
    <circle cx="$(($size/2))" cy="$(($size/2))" r="$(($size/2 - 10))" fill="url(#grad)"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="$(($size/2))" fill="white">🎙️</text>
</svg>
EOF
        echo "✅ Generated $ICONS_DIR/icon-${size}x${size}.svg"
    done

    echo ""
    echo "⚠️  Note: SVG icons created. For best compatibility, install ImageMagick:"
    echo "   sudo apt-get install imagemagick"
    echo "   Then run this script again to generate PNG icons."
fi

echo ""
echo "✅ Icon generation complete!"
echo "Icons location: $ICONS_DIR/"
