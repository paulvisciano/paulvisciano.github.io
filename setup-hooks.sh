#!/bin/bash

# Create the .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy all hooks from the hooks directory to .git/hooks
cp hooks/* .git/hooks/

# Make all hooks executable
chmod +x .git/hooks/*

echo "Git hooks installed successfully!" 