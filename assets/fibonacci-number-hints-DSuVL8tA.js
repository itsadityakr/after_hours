var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write the first ten out by hand: start 0, 1, and keep adding the last two. Now
look at what you had to remember at each step. It is less than you think, and
that is the problem solved.

## 1. How far back does one step look?

To write the next number you needed two things. Not the list, not the ten
numbers before it — two. If your plan involves an array of size \`n\`, ask whether
you ever read anything from it except the last two entries.

## 2. The two ends of the loop

The sequence is *defined* at 0 and 1, so those two are answers rather than
things to compute. That tells you where your loop starts and what it starts
holding.

## 3. Moving two variables at once

You hold the previous two. The next round needs the second one and their sum.
Try writing that as two assignments, then trace \`n = 4\` by hand *reading your
own lines in order*. If the second line uses something the first line has
already changed, you will get the wrong answer from the third number on — and
the fix is one extra variable.

## 4. The version you should not submit

The definition can be written as a function that calls itself twice, and it is
correct. Before you use it, count roughly how many calls \`fib(30)\` makes, and
compare that with how many additions the loop makes. That gap is the whole
reason this problem is on the sheet.

## 5. When the numbers stop fitting

Not needed for the given limits, but worth knowing: an \`int\` holds a Fibonacci
number up to about the 46th. Ask yourself what your code returns at the 47th,
and whether it would be obvious that something went wrong.

## 6. If none of that was enough

Three variables, one addition per round, and the two guards in front. The loop,
the assignment order and the cost of the recursive version are on the **Notes**
tab.
`;export{e as default};