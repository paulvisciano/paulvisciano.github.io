const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://127.0.0.1:8080';
const ISTANBUL_EPISODE_URL = `${BASE_URL}/moments/istanbul/2025-09-24/`;

// Test data
const testCases = [
  {
    name: 'Istanbul Episode - 16 pages',
    url: ISTANBUL_EPISODE_URL,
    expectedPages: 16,
    expectedSpreads: [
      { page: 1, left: 'page-01.png', right: 'page-02.png' },
      { page: 3, left: 'page-03.png', right: 'page-04.png' },
      { page: 5, left: 'page-05.png', right: 'page-06.png' },
      { page: 7, left: 'page-07.png', right: 'page-08.png' },
      { page: 9, left: 'page-09.png', right: 'page-10.png' },
      { page: 11, left: 'page-11.png', right: 'page-12.png' },
      { page: 13, left: 'page-13.png', right: 'page-14.png' },
      { page: 15, left: 'page-15.png', right: 'page-16.png' }
    ]
  }
];

async function runComicReaderTests() {
  console.log('🚀 Starting Comic Reader Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    for (const testCase of testCases) {
      console.log(`📖 Testing: ${testCase.name}`);
      console.log(`   URL: ${testCase.url}`);
      console.log(`   Expected pages: ${testCase.expectedPages}`);
      
      const page = await browser.newPage();
      
      // Enable console logging
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('   ❌ Console Error:', msg.text());
        }
      });

      try {
        await testComicReader(page, testCase);
        console.log(`   ✅ ${testCase.name} - PASSED\n`);
      } catch (error) {
        console.log(`   ❌ ${testCase.name} - FAILED: ${error.message}\n`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  
  console.log('🎉 All tests completed!');
}

async function testComicReader(page, testCase) {
  // Navigate to the comic episode
  await page.goto(testCase.url, { waitUntil: 'networkidle0' });
  
  // Wait for the page to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 1: Initial navigation should show cover
  console.log('   🔍 Testing initial cover display...');
  const currentUrl = page.url();
  if (!currentUrl.includes('#cover')) {
    throw new Error(`Expected URL to contain #cover, got: ${currentUrl}`);
  }
  
  // Wait for cover element to be present
  try {
    await page.waitForSelector('.comic-cover-display', { timeout: 10000 });
  } catch (error) {
    throw new Error('Cover element not found within timeout');
  }
  
  // Check if cover is visible
  const coverVisible = await page.evaluate(() => {
    const coverElement = document.querySelector('.comic-cover-display');
    return coverElement && coverElement.style.display !== 'none';
  });
  
  if (!coverVisible) {
    throw new Error('Cover should be visible on initial load');
  }
  
  console.log('   ✅ Cover displayed correctly');
  
  // Test 2: Click cover to open comic book
  console.log('   🔍 Testing cover click to open comic...');
  await page.click('.comic-cover-display');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Should now show pages 1-2
  const urlAfterCoverClick = page.url();
  if (!urlAfterCoverClick.includes('#page-1')) {
    throw new Error(`Expected URL to contain #page-1 after cover click, got: ${urlAfterCoverClick}`);
  }
  
  // Verify pages 1-2 are displayed
  await verifySpread(page, 1, 'page-01.png', 'page-02.png');
  console.log('   ✅ Pages 1-2 displayed correctly');
  
  // Test 3: Navigate through all spreads
  console.log('   🔍 Testing navigation through all spreads...');
  
  for (let i = 0; i < testCase.expectedSpreads.length - 1; i++) {
    const currentSpread = testCase.expectedSpreads[i];
    const nextSpread = testCase.expectedSpreads[i + 1];
    
    // Click right page to go to next spread
    await page.click('.simple-flipbook-page.right-page');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify URL updated
    const expectedUrl = `#page-${nextSpread.page}`;
    const currentUrl = page.url();
    if (!currentUrl.includes(expectedUrl)) {
      throw new Error(`Expected URL to contain ${expectedUrl}, got: ${currentUrl}`);
    }
    
    // Verify correct pages are displayed
    await verifySpread(page, nextSpread.page, nextSpread.left, nextSpread.right);
    console.log(`   ✅ Pages ${nextSpread.page}-${nextSpread.page + 1} displayed correctly`);
  }
  
  // Test 4: Test backward navigation
  console.log('   🔍 Testing backward navigation...');
  
  // Go back to the beginning (we're currently on page 15-16, need to go back 7 spreads)
  for (let i = 0; i < 7; i++) {
    await page.click('.simple-flipbook-page.left-page');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Should be on pages 1-2 again
  const finalUrl = page.url();
  if (!finalUrl.includes('#page-1')) {
    throw new Error(`Expected URL to contain #page-1 after backward navigation, got: ${finalUrl}`);
  }
  
  await verifySpread(page, 1, 'page-01.png', 'page-02.png');
  console.log('   ✅ Backward navigation working correctly');
  
  // Test 5: Test direct URL navigation
  console.log('   🔍 Testing direct URL navigation...');
  
  // Navigate directly to a middle spread
  await page.goto(`${testCase.url}#page-5`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check what URL we actually ended up at
  const directUrl = page.url();
  console.log('   Direct URL result:', directUrl);
  
  await verifySpread(page, 5, 'page-05.png', 'page-06.png');
  console.log('   ✅ Direct URL navigation working correctly');
  
  // Test 6: Test edge cases
  console.log('   🔍 Testing edge cases...');
  
  // Try to go beyond last page (should stay on last spread)
  const lastSpread = testCase.expectedSpreads[testCase.expectedSpreads.length - 1];
  await page.goto(`${testCase.url}#page-${lastSpread.page}`);
  await page.waitForTimeout(500);
  
  // Click right page - should not advance beyond last spread
  await page.click('.simple-flipbook-page.right-page');
  await page.waitForTimeout(500);
  
  const urlAfterLastPage = page.url();
  if (!urlAfterLastPage.includes(`#page-${lastSpread.page}`)) {
    throw new Error(`Expected to stay on page ${lastSpread.page}, got: ${urlAfterLastPage}`);
  }
  
  console.log('   ✅ Edge case handling working correctly');
}

async function verifySpread(page, expectedPage, expectedLeftImage, expectedRightImage) {
  // Check that the correct images are loaded
  const spreadInfo = await page.evaluate(() => {
    const leftPage = document.querySelector('.simple-flipbook-page.left-page');
    const rightPage = document.querySelector('.simple-flipbook-page.right-page');
    
    const leftImg = leftPage?.querySelector('img');
    const rightImg = rightPage?.querySelector('img');
    
    return {
      leftImageSrc: leftImg?.src || null,
      rightImageSrc: rightImg?.src || null,
      leftImageLoaded: leftImg?.complete || false,
      rightImageLoaded: rightImg?.complete || false
    };
  });
  
  // Verify left page image
  if (!spreadInfo.leftImageSrc || !spreadInfo.leftImageSrc.includes(expectedLeftImage)) {
    throw new Error(`Expected left page to show ${expectedLeftImage}, got: ${spreadInfo.leftImageSrc}`);
  }
  
  // Verify right page image
  if (!spreadInfo.rightImageSrc || !spreadInfo.rightImageSrc.includes(expectedRightImage)) {
    throw new Error(`Expected right page to show ${expectedRightImage}, got: ${spreadInfo.rightImageSrc}`);
  }
  
  // Verify images are loaded
  if (!spreadInfo.leftImageLoaded || !spreadInfo.rightImageLoaded) {
    throw new Error('Images should be loaded');
  }
}

// Run the tests
if (require.main === module) {
  runComicReaderTests().catch(console.error);
}

module.exports = { runComicReaderTests, testCases };
