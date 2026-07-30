var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Reduce 14 to zero on paper, writing the whole chain down with an arrow per step.
Then do 8. Then do 0 — that one takes a second and it is the input that breaks
most solutions.

## 1. There is nothing to decide

At every number the rule tells you which move to make: even means halve, odd
means subtract one. No choice, no lookahead, nothing to optimise. So the
solution is to follow the rule and count how many times you did.

## 2. Even or odd

You already know the operator that answers this — it is the same one this whole
topic runs on. Note that halving an \`int\` is plain integer division, and it is
exact here because you only halve when the number is even.

## 3. Where does the loop stop?

Write the condition from the destination rather than from the number: you stop
when you get to zero. Do that and the input 0 answers 0 for free, with no
special case in front.

## 4. Count once, not twice

If you put a \`count++\` inside both branches, they will one day disagree. There
is a place to put a single one that always runs.

## 5. Convince yourself it ends

Halving makes the number smaller. Subtracting one does not make it much smaller
— but it does make it something, and that something is always halvable. Say what
happens over any two consecutive steps, and you have both the termination
argument and the complexity.

## 6. For the complexity question

Write your test numbers in binary and put the step count next to each. Then look
at the number of bits, and at how many of them are 1. The answer is sitting
there, and it is the reason the complexity is what it is.

## 7. If none of that was enough

One loop, one counter, \`num != 0\`. The loop, what it is doing in binary, and the
closed form for the step count are on the **Notes** tab.
`;export{e as default};