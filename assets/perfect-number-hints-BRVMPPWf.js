var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write down, by hand, the divisors of 6, 28, 16 and 1 — and for each, the sum of
the ones that are not the number itself. Two of those four are the inputs that
break most submissions, and you will meet both again below.

## 1. Read "proper divisors" carefully

The sum leaves out one particular divisor. Say which, and say what would happen
to every answer if you left it in.

Then decide what that means for the bounds of your loop, before you write it.

## 2. Now the smallest input

\`num = 1\`. List its divisors. Now list its *proper* divisors.

What is the sum of an empty list, and is that equal to 1? Your method has to
return the right thing here, and you should know the answer before your code
does.

## 3. Write the obvious version and time it in your head

Loop from 1 to \`num - 1\`, keep what divides, add it up. That is correct, and it
is also the version you are here to replace.

The constraint goes to 10⁸. Multiply that out: how many \`%\` operations is one
call? Compare it against a few hundred million operations a second, and remember
the judge will hand you the largest input on purpose.

## 4. Write the divisors down as products

For 28, do not write \`1, 2, 4, 7, 14\`. Write it like this instead:

\`\`\`text
1 × 28    2 × 14    4 × 7
\`\`\`

Look at the left column and the right column. Something is true about every row,
and it is the answer to this problem.

## 5. Where do the two columns meet?

Keep going with your pairs for a bigger number — try 36, or 100. The left column
climbs, the right column falls, and they cross somewhere.

Work out where, and then prove it to yourself: if \`num = a × b\` and *both* \`a\`
and \`b\` were bigger than that crossing point, what would \`a × b\` be?

That proof is what lets you stop the loop early, and it is worth being able to
say out loud in an interview.

## 6. Rewrite the loop condition

You want to stop at the square root. There are two ways to write that: one uses
\`Math.sqrt\`, one uses a multiplication.

One of them is exact and one of them is floating point. Decide which you want
deciding your loop bound, and think about what happens at a boundary where the
number *is* a perfect square.

## 7. One pair cannot follow the rule

Your loop now adds both members of every pair it finds. Start it at 1 and write
down what the first pair contributes.

That pair has a member the definition told you to exclude. It cannot be handled
inside the loop with the others — deal with it once, outside, and then start the
loop past it.

## 8. Run it on 16

If your method says 16 is perfect, or gives a sum of 19, look at the pair it
found when \`d\` was 4.

What is \`num / d\` there? Add both members of *that* pair and count how many times
4 went in. Then write the one-line test that stops it.

This is why 16 was on the list at the top: 6, 28, 496 and 8128 are none of them
squares, so a test set made only of perfect numbers will pass without this fix.

## 9. Go back to 1

You seeded your sum with something in hint 7. With that seed in place, walk
\`num = 1\` through your method again.

If it now returns \`true\`, you know exactly which line to add and where.

## 10. If none of that was enough

The pairs of 28 drawn out, the full dry run including 16 and 1, why the square
guard matters, and the reason there are only five perfect numbers in the whole
range are on the **Notes** tab.
`;export{e as default};