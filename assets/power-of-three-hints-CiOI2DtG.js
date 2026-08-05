var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Decide what the answer is for 0, for −27, for 1 and for 45. The first is a trap
for the loop you are about to write; the third is a power of three whether or
not it feels like one.

## 1. The version the definition gives you

A power of three is one, tripled some number of times. Take the tripling back
out: while the number divides by three exactly, divide it, and look at what is
left. One value means yes and every other value means no.

That is a complete answer. Write it before you try to be shorter.

## 2. The input that makes that loop never end

One number divides by three exactly and does not change when you do it. Work out
which, and reject it before the loop starts rather than inside it.

## 3. Do not go looking for the bit trick

If you have done Power of Two you are hunting for the same shape here, and it is
not there. That trick works because the machine already stores numbers in base
two, so a power of two arrives with one bit set. Nothing in a register is in
base three. Stop looking and count instead.

## 4. Count them

How many powers of three fit in an \`int\`? Start at 1 and keep multiplying — you
will run out sooner than you expect. Write down the largest one.

## 5. What that largest one is divisible by

Every smaller power of three divides it. The useful half of the fact is the
other direction: *nothing else does*. Ask yourself why not, and the answer is a
one-word property of the number 3 — the same word makes the argument work for 2
and fail for 6.

That gives you a solution which is a single \`%\`. Mind the sign: in Java \`%\`
takes its sign from the left operand, so a negative \`n\` sails straight through
a test that only checks for a remainder of zero.

## 6. If you are about to use logarithms

3^k = n means k = log n / log 3, so the test is "is that a whole number". Before
you write it, try it by hand on 243 using \`Math.log\`, and print the ratio rather
than the boolean. The number you get back is the reason this approach is on the
Notes page as a warning rather than as an answer.

## 7. The rule underneath that

If the answer is a whole number, keep the whole calculation in whole numbers.
\`double\` division is exact almost every time, and "almost" is not a property you
can build a correctness argument on.

## 8. If none of that was enough

The loop, the one-division version and the primeness argument that justifies it,
the exact input that breaks the logarithm version, and what each one costs are
on the **Notes** tab.
`;export{e as default};