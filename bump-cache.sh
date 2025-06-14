#!/bin/bash

# Run the Node.js script to bump the cache version
node bump-cache.js

# Add the changes to git staging
git add sw.js

echo "Cache version bumped and changes staged!" 