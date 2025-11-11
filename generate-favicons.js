const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = 'public/better-prompt-alpha.png';
const outputDir = 'public';

// Check if input image exists
if (!fs.existsSync(inputImage)) {
  console.error(`Input image ${inputImage} not found!`);
  process.exit(1);
}

async function generateFavicons() {
  try {
    console.log('Generating favicons...');

    // Read the input image
    const image = sharp(inputImage);

    // Get image info
    const metadata = await image.metadata();
    console.log(`Input image: ${metadata.width}x${metadata.height}`);

    // Generate different sizes
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
      { size: 150, name: 'mstile-150x150.png' },
    ];

    // Generate PNG favicons
    for (const { size, name } of sizes) {
      await image
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(path.join(outputDir, name));

      console.log(`Generated ${name} (${size}x${size})`);
    }

    // Generate ICO favicon (32x32)
    await image
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('Generated favicon.ico (32x32)');

    // Generate Safari pinned tab SVG (monochrome)
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <style>
          .cls-1 { fill: #00ffff; }
        </style>
      </defs>
      <circle cx="50" cy="50" r="45" class="cls-1"/>
      <circle cx="35" cy="35" r="8" fill="none" stroke="#000" stroke-width="2"/>
      <circle cx="65" cy="35" r="8" fill="none" stroke="#000" stroke-width="2"/>
      <path d="M30,65 Q50,75 70,65" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    </svg>`;

    fs.writeFileSync(path.join(outputDir, 'safari-pinned-tab.svg'), svgContent);
    console.log('Generated safari-pinned-tab.svg');

    // Generate web app manifest
    const manifest = {
      name: "Better Prompt - AI Prompt Optimizer",
      short_name: "Better Prompt",
      description: "Transform your ideas into powerful, optimized prompts that get better results from AI models",
      start_url: "/",
      display: "standalone",
      background_color: "#0a0a0a",
      theme_color: "#00ffff",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    fs.writeFileSync(path.join(outputDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
    console.log('Generated site.webmanifest');

    // Generate browserconfig.xml for Microsoft tiles
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>#00ffff</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

    fs.writeFileSync(path.join(outputDir, 'browserconfig.xml'), browserconfig);
    console.log('Generated browserconfig.xml');

    console.log('\n✅ All favicons generated successfully!');
    console.log('Files created:');
    console.log('- favicon.ico');
    console.log('- favicon-16x16.png');
    console.log('- favicon-32x32.png');
    console.log('- apple-touch-icon.png');
    console.log('- android-chrome-192x192.png');
    console.log('- android-chrome-512x512.png');
    console.log('- mstile-150x150.png');
    console.log('- safari-pinned-tab.svg');
    console.log('- site.webmanifest');
    console.log('- browserconfig.xml');

  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();