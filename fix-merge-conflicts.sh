#!/bin/bash

echo "=== Git Merge Conflict Resolver ==="
echo "Checking current git status..."
echo ""

# Show current status
git status

echo ""
echo "=== Instructions ==="
echo "1. Look for files marked as 'both modified' or 'unmerged paths'"
echo "2. Open those files in your editor"
echo "3. Look for conflict markers:"
echo "   <<<<<<< HEAD"
echo "   Your changes"
echo "   ======="
echo "   Incoming changes"
echo "   >>>>>>> branch-name"
echo "4. Resolve conflicts by choosing which changes to keep"
echo "5. Remove all conflict markers (<<<<<<<, =======, >>>>>>>)"
echo "6. Save the files"
echo "7. Run: git add ."
echo "8. Run: git commit"
echo ""
echo "Alternative (if you want to abort): git merge --abort"