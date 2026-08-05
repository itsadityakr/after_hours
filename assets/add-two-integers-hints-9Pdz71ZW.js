var e=`There is nothing to be stuck on in the question as asked, so these are for the
follow-up: the same sum with \`+\` and \`-\` taken away from you.

## Before any hint at all

Write \`return num1 + num2;\` and submit it. Then read the constraints — both
numbers are between −100 and 100 — and say out loud why that sentence is the
reason your one line is correct rather than merely accepted.

## 1. The question behind the question

Ask what would happen if the constraints were ±2000000000 instead. Try it in a
scratch file and print the answer before you predict it. An \`int\` is 32 bits;
the true sum of two numbers that size needs 33.

Then work out the two ways of not being wrong about it. One changes a type, the
other changes the method you call.

## 2. Now take the plus sign away

This is [Sum of Two Integers](problem:sum-of-two-integers), and it is the reason
this problem is worth a page. You may use the bitwise operators and nothing
arithmetic.

## 3. Do one addition by hand, in binary

13 is \`1101\` and 7 is \`0111\`. Add them the way you were taught to add in
columns, right to left, and write down two things for each column: the digit
that stays there, and the digit that moves left.

Do not skip this. Everything below is a name for something on that piece of
paper.

## 4. The digit that stays

Look at your four columns. In which ones did the digit that stays come out as 1?
In the ones where exactly one of the two inputs had a 1. That is an operator you
already know — and applied to the whole number at once, it gives you the whole
row.

## 5. The digit that moves

Same question for the carries: a column carries when *both* inputs had a 1.
Another operator you already know. But a carry does not belong in the column
that produced it — it belongs one place to the left, and there is an operator
for that too.

## 6. You now have \`sum = A + B\` again

You have the sum-without-carries and you have the carries. Adding those two
together is the same problem you started with, which sounds circular and is not:
the second one is smaller every time, because carries run out.

So do it again with those two as the new inputs. What is the condition that says
you are finished?

## 7. Negative numbers

Try \`-10\` and \`4\` through your loop before you go writing a special case for the
sign. Java stores negatives in two's complement, which is the representation
your loop is already working in.

## 8. If none of that was enough

The loop, the column-by-column table it comes from, why the sign needs no
special case, and what the constraints have to do with any of it are on the
**Notes** tab.
`;export{e as default};