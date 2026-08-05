var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Work out the answers for \`n = 5\`, \`n = 10\` and \`n = 25\` on paper. The first two
you can do by writing the factorial down. The third one you cannot, and noticing
*why* you cannot is the first real step.

## 1. Say what a trailing zero actually is

A number ending in three zeros is divisible by 1000. A number ending in exactly
three zeros is divisible by 1000 and not by 10000.

So "how many trailing zeros" is a question about divisibility, not about digits.
Rewrite the problem for yourself as a sentence beginning "how many times does …".

## 2. Factor the thing you are counting

You are counting how many times 10 divides \`n!\`. 10 is not prime — write it as a
product of primes.

Now you have two counts to make instead of one, and a rule for combining them.
What has to be true for \`n!\` to have five trailing zeros? Say it in terms of the
two primes.

## 3. One of the two counts is never the answer

Count how many numbers between 1 and 100 contribute a factor of 2. Count how many
contribute a factor of 5. You do not need exact totals — the ratio is enough.

One of the two is always in shorter supply, for every \`n\`. Once you are sure
which, you can stop counting the other one entirely, and half the problem is
gone.

## 4. Before you write the loop, price the obvious version

You may still be planning to compute \`n!\` and count the zeros off the end.
Try it for \`n = 21\` in a \`long\` and print the result.

Then work out how many digits \`10000!\` has. Whatever type you were going to use,
say out loud what it does with a number that size — and if your answer is
\`BigInteger\`, ask what it costs to build a 35660-digit number in order to return
a four-digit one.

## 5. Count the fives without visiting every number

The naive count is a loop from 1 to \`n\` asking each number how many 5s it has.
That works. It is also \`n\` steps, and it is doing something repetitive you can
collapse.

How many numbers from 1 to \`n\` are divisible by 5? Answer that with one division,
not a loop.

## 6. Some numbers have more than one five

Your one division counted 25 as contributing a single 5. Write 25 out as a
product of primes and check whether that is true.

Now: which numbers from 1 to \`n\` have a *second* 5 to give? How many of them are
there? Answer that with one division as well.

Then keep going. Where does the sequence stop, and why does it stop on its own?

## 7. Look at what you are dividing

Write down your three or four divisions for \`n = 100\`. Look at the divisors: 5,
then 25, then 125.

There is a way to get the same sequence of counts by dividing the same variable
by 5 over and over, instead of dividing the original by a growing power. Work out
what that variable holds after each division — it has a meaning, and it is not
"n reduced".

## 8. Two details that go wrong

Your loop condition: think about what \`0 / 5\` is, and what happens if you wrote
\`>= 0\` instead of \`> 0\`.

Your loop body: you have a divide and an add. Try both orders on \`n = 100\` and
see which one gives 24.

## 9. Check the one that catches everybody

Run your method on \`n = 25\`. If it says 5, you are only counting first-order
fives — go back to hint 6. The answer is 6.

Then run \`n = 4\` and \`n = 0\`.

## 10. If none of that was enough

Why 21! is silently wrong in a \`long\`, why \`n = 66\` makes the naive version hang
forever, the pairing of 2s and 5s drawn out, and the full dry run for 10000 are
on the **Notes** tab.
`;export{e as default};