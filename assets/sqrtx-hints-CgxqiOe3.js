var e=`The scan that solves this is three lines and it passes. The hints go past it
anyway, because the reason this problem is set is the thing the scan does not do.

## Before any hint at all

Write down \`mySqrt(0)\`, \`mySqrt(1)\`, \`mySqrt(8)\`, \`mySqrt(15)\` and \`mySqrt(16)\`.

If you hesitated on 8 or 15, say the task back to yourself in a sentence that
does not contain the words "square root". The sentence you want has the word
*largest* in it.

## 1. The answer is a boundary

Finish this: the answer is the largest \`k\` such that ____.

Now take that condition and evaluate it for \`k = 0, 1, 2, 3, 4, 5\` with \`x = 8\`.
Write true or false under each. Look at the row of trues and falses — it has a
shape, and that shape is the entire problem.

## 2. Write the scan

Count up from 1 until the condition stops holding, then return. Three lines.

Submit it. It passes, and everything below is about a thing that passes, which is
easier to argue with when it is on your own screen.

## 3. Before you trust it, break it

Run your scan on \`x = 2147483647\`.

If it returned something strange, or looped forever, look at the expression in
your loop condition and ask what type each side is. There is a multiplication
there, and it is being done in the wrong type.

There are two ways to write the cast. One of them multiplies as \`int\`s and then
widens the wreckage. Write both, run both on 2147483647, and keep the one that
works — being able to see the difference between them is worth more here than the
answer.

## 4. Where does the answer sit relative to where the loop stopped?

Your loop exits on the first candidate whose square went past \`x\`. That candidate
is not the answer.

Say which one is, and say it in terms of the variable the loop left behind. If you
find yourself needing a second variable to remember the last good value, you do
not — the stopping point already tells you.

## 5. Check zero without adding anything

Walk \`x = 0\` through your scan by hand.

How many times does the body run? What does the loop variable hold at the end?
What comes back? If a guard for zero is in your code, delete it and check again —
it should still be right.

## 6. Now count the turns

For \`x = 2147483647\` the scan takes 46340 turns. It passes.

So say why it is still the wrong answer to this question. The clue is where the
problem is filed: it is not on a list about arithmetic.

## 7. Go back to your row of trues and falses

Look at hint 1's row again. Once the condition is false for some \`k\`, what do you
know about \`k + 1\`, \`k + 2\`, and every candidate after them? Say why — one
sentence about squaring is enough.

The scan knew that and used none of it. Every turn it tested one candidate and
ruled out one candidate.

## 8. Ask the question in the middle instead

If you test the middle candidate of a range and the answer comes back false, how
much of the range have you just ruled out? And if it comes back true?

Write down the range you start with. The bottom is easy. For the top, do not
write \`x\` without thinking: what is the largest answer this problem can ever have,
and how do you know?

## 9. Two details that decide whether it works

First: when the middle candidate's square is *not* past \`x\`, that candidate is
still a possible answer. So when you move the boundary, one of the two sides must
not step over it. Say which side keeps the mid and which side skips it.

Second: write your midpoint as \`(lo + hi) / 2\` and then find the pair of bounds
in this problem's range that makes that expression wrong. There is a standard
rewrite. Use it, and be able to say what it is defending against.

## 10. And what do you return?

When the loop ends, \`lo\` and \`hi\` have crossed. One of them is the answer and one
of them is one past it.

Do not guess. Trace \`x = 8\` on paper, four or five turns, writing \`lo\`, \`hi\` and
\`mid\` in a table. Then trace \`x = 0\` and \`x = 1\`. If you keep a separate variable
that records the last candidate that passed, you can return that instead and never
have to reason about which boundary won — that version is easier to defend out
loud, and no slower.

## 11. If none of that was enough

The scan with its turn count printed, the cast that looks fixed and is not, the
state of every candidate drawn out turn by turn, and the two costs charted
against each other are on the **Notes** tab.
`;export{e as default};