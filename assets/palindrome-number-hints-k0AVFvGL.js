var e=`Read one, close the page, and go back to the editor. They are in order, and they
stop before the answer.

## Before any hint at all

Decide, on paper, what the answer is for −121, for 10, for 0 and for 1221. Three
of those four are where solutions break, and all four take ten seconds.

## 1. The version you already know how to write

Turn the number into text, reverse the text, compare. That is a correct
solution, it is three lines, and you should write it first — a correct slow
answer beats a clever wrong one, and it gives you something to check the real
answer against.

Then read the follow-up, which is where the actual problem starts: **do it
without converting to a string.**

## 2. What "without a string" leaves you

The digits of a number are available with the two operators this whole topic
runs on: one hands you the last digit, the other drops it. You do not need
characters to know a number's digits, and that is the point being made.

## 3. The obvious plan, and the reason it breaks

The obvious plan is: reverse the whole number, compare it with the original. Try
it with a number close to \`Integer.MAX_VALUE\` and ask whether the reversal still
fits in an \`int\`. It does not have to — and the answer to that is not "use a
long", because the follow-up is asking you to notice something better.

## 4. You do not need the whole reversal

To know whether a word reads the same backwards, you compare the front half with
the back half. Nothing about that needs the whole thing reversed. So: build the
reverse of **half** the number while the other half shrinks, and stop when they
meet.

## 5. When have they met?

You have two numbers: what is left of the original, and the reversed part you
have built. Each pass moves one digit from the first to the second. Write down
the condition that is true while the first is still the longer of the two — that
condition is your \`while\`.

## 6. Odd digit counts

Work 12321 through your loop by hand. When the loop ends, what is in each of the
two numbers? They are not equal, and the answer is still true. One digit is in
the wrong place and you already know the operator that removes it.

## 7. Two things to reject before the loop starts

One is a sign. The other is a number ending in zero — think about what its
reverse would have to start with. Careful with the second: there is exactly one
number ending in zero that *is* a palindrome, and rejecting it is the bug this
guard usually ships with.

## 8. If none of that was enough

Both solutions, the two guards, why the loop ends where it does, the odd-length
case, and the memory difference that is the whole reason for the second version
are on the **Notes** tab.
`;export{e as default};