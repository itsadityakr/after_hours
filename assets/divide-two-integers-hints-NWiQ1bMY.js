var e=`This one is not hard because of the algorithm. It is hard because of the two ends
of an \`int\`, and the hints spend as long there as they do on the loop.

## Before any hint at all

Write down the answers to these four by hand, and say which rule you used:

\`\`\`text
10 / 3      7 / -3      -7 / 3      -7 / -3
\`\`\`

If any of the negative three came out one further from zero than the real answer,
you have applied floor division. Find the word in the problem statement that says
otherwise before going on.

## 1. What is division, if you cannot divide?

Say what \`10 / 3\` means in terms of an operator you *are* allowed to use. Not a
formula — a procedure, in one sentence.

Write that procedure. It is three or four lines and it is correct. Submit it,
because the argument in the rest of these hints is with a thing that exists.

## 2. Time it before the judge does

Your loop runs once per something. Say what that something is — and note that it
is not the number of digits in the input.

Now pick the worst pair of arguments in the whole \`int\` range for it and say how
many turns that is. Compare against a few hundred million operations a second.

## 3. The signs are a distraction, so get rid of them

There are two ways to handle negatives: keep them all the way through, or strip
them at the start and put one back at the end.

Take the second. Write down the test for "the answer is negative" using only the
two original arguments. It is one line, and there is an operator that says it
more plainly than \`if\`/\`else\` does.

Then check the rounding: with magnitudes, your loop rounds a positive number
down. Does negating that afterwards give you −2 or −3 for \`7 / -3\`? That is not
an accident, and it is why this order was worth choosing.

## 4. Now the input that is about to ruin it

\`Integer.MIN_VALUE\` is −2147483648. \`Integer.MAX_VALUE\` is 2147483647.

Print \`Math.abs(Integer.MIN_VALUE)\` and look at what comes back. Then say why —
in terms of how many numbers an \`int\` has and where zero sits among them.

Once you can say why, the fix is one word in one place. It is not a special case
and it is not an \`if\`.

## 5. And the one answer that does not exist

There is exactly one pair of \`int\`s whose quotient cannot be stored in an \`int\`.
Find it. Not a family of them — one pair.

Say what the true answer is, then read the statement for what you are supposed to
return instead. That is a guard, and it goes before every other line in the
method, including the one you fixed in hint 4.

## 6. Back to the loop, and the thing it forgets

Watch your subtraction loop take 3 away from 100. After the first turn it knows
something. After thirty turns it knows the same thing thirty times.

Write down what it learns on turn one that would have saved it turn two — and
then what that fact, applied to itself, would have saved.

## 7. Build the ladder on paper

For \`100 / 3\`, write out this row and keep going until a number passes 100:

\`\`\`text
3    6    12    24    48    96    192
\`\`\`

Under each, write how many threes it is worth. Now take 100 and, reading the row
from the right, subtract greedily. Write down which entries you used and add up
their counts.

Check it against 33. Then say how many subtractions that was, against the number
you got in hint 2.

## 8. Turn the row into two loops

The outer loop is "while there is still something left to take". The inner loop
builds the row and stops.

Say precisely when the inner loop stops. Careful here: it must never leave you
holding a rung that is bigger than what is left, so the condition it tests is
about the *next* rung rather than the current one.

## 9. The two lines in the middle have to agree

Each outer turn you take a rung off what is left, and you add something to the
answer. They are not the same number.

Write both as an expression in your rung counter. If you can say in one sentence
why the two are the same operation, you have it; if not, go back to the counts
you wrote under the row in hint 7.

One more thing to check in the inner loop: your rung is built by shifting. What
type is the value being shifted, and what would \`<< 31\` do to it if that type
were \`int\`? Try it.

## 10. Reset, and then test the edges

There is a variable in the inner loop that must start fresh on every outer turn.
Say what goes wrong if it does not — trace one concrete pair and watch what is
left go negative.

Then run these four and be able to explain each: \`−2147483648 / −1\`,
\`−2147483648 / 1\`, \`−2147483648 / −2\`, \`2147483647 / 1\`. The second one is the
interesting one — look at what your rung counter reaches there, and at what you
are adding to an \`int\` accumulator when it does.

## 11. If none of that was enough

The subtraction version with its cost printed, the doubling ladder drawn, the
\`Math.abs\` trap, and a straight answer about what happens to the accumulator at
\`−2147483648 / 1\` are on the **Notes** tab.
`;export{e as default};