var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write down what your answer should be for 0, for −16, for \`Integer.MIN_VALUE\`
and for 6. Three of those four are about the sign, and they are where nearly
every wrong submission on this problem goes wrong.

## 1. The version the definition gives you

A power of two is one, doubled some number of times. So take the doubling back
out: while the number is even, halve it, and look at what you are left holding.
There is exactly one value that means yes.

Write that. It is a complete, correct answer, and everything below is about
making it shorter, not about making it right.

## 2. The input that makes that loop never end

One of the four numbers above is even, and halving it does not change it. Work
out which, and put the guard in before the loop rather than inside it.

## 3. Now stop dividing and start looking

Write 1, 2, 4, 8 and 16 out in binary, one under the other, and read down the
column. Say the pattern as a sentence about bits, not as a sentence about zeros.
The sentence you want has the word *one* in it, twice.

## 4. What subtracting 1 does to a number

Take 16, which is \`10000\`, and subtract 1. Then take 12, which is \`1100\`, and
subtract 1. In one case the number changed completely; in the other the top of
it did not move. That difference *is* the problem.

## 5. Put the two of them together

You have \`n\` and you have \`n - 1\`. There is one operator that asks "which bits
do these two have in common", and the answer to that question tells the two
cases above apart in a single expression.

## 6. Two numbers still get through

Your expression is now true for two inputs that are not powers of two. One is
zero. The other is the most negative \`int\` there is — write it in binary and you
will see immediately why it fools a test about bits. One comparison in front of
the expression rejects both.

## 7. A different way of being clever

Count how many powers of two there are that fit in an \`int\`. It is a small
number, and the largest of them is a number you can write down. Every other one
divides it exactly — and since 2 is prime, nothing else does. That is a whole
solution in one \`%\`.

Be ready for the follow-up: what makes that argument work is a property of the
number 2 itself, and an interviewer may ask you to say which.

## 8. If none of that was enough

All three versions, the reason the guard is not optional, the primeness argument
behind the third, and what the three cost are on the **Notes** tab.
`;export{e as default};