var e=`Read one, close the page, and go back to the editor. Each one below says the
next thing and no more than that — they are in order, and the last one is not
the answer either.

## Before any hint at all

Write the first fifteen answers out by hand. Sixty seconds, on paper, no
keyboard. If you cannot produce them by hand you are not stuck on Java, you are
stuck on the rule — and everything below assumes you have the rule.

## 1. What is the loop counting?

The question asks for an answer for **every number from 1 to n**, in order, and
never asks you to skip one or go back. So there is one loop, it counts, and it
runs exactly \`n\` times. Decide that before anything else: what the loop counts
is the decision that fixes the shape of every other line.

## 2. How do you ask "is it a multiple of three"?

You already know the operator. A number divides evenly by three when the
remainder of dividing by three is nothing left over — and Java has one operator
that hands you exactly that. The test is six characters long.

## 3. There are four cases, not three

Multiple of three. Multiple of five. **Multiple of both.** Anything else. The
third one is the whole problem — every number that is a multiple of fifteen
belongs to it, and it is not a special case bolted on, it is one of the four
answers the rule lists.

## 4. Order matters, and it will not warn you

Once you write the four cases as a chain of \`if\` / \`else if\`, only the *first*
one that matches ever runs. Now look again at the number 15: two of your tests
are true for it. Which one runs? Is it the one you wanted?

Try your code on \`n = 15\` before you try it on anything else. \`n = 5\` passes for
code that is wrong.

## 5. Building the answer

Whatever you decide each pass says, it has to be a \`String\` — even for the
numbers, which means the number has to be turned into one. And the answer as a
whole is a list you add to once per pass, not something you print, unless the
signature says otherwise.

## 6. If none of that was enough

The chain is four branches and one of them is tested first for a reason. The
full solution, why the order is what it is, and what the loop costs in time and
memory are on the **Notes** tab.
`;export{e as default};