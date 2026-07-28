var e=`Every other topic on this sheet hands you an input and asks for an answer. This
one hands you a specification. "Write a class called \`LRUCache\`. It has \`get\` and
\`put\`. Both must run in O(1)." There is no array to scan and no recursion to
write. There is a list of operations and a time limit next to each one.

That changes what the work is. You are not looking for a clever algorithm, you
are choosing containers, and **no single container gives you everything the
specification asks for**. A \`HashMap\` finds a key instantly and has no idea which
key was touched most recently. A linked list keeps an order and cannot find
anything. A heap gives you the smallest and cannot find an arbitrary element.

So the answer is almost always two structures, held at once and kept in step. A
map for the lookup and a list for the order. A map for the lookup and a heap for
the priority. An array for the random pick and a map for where each value sits.
Most of these questions then become the same question: which two, and what has to
happen on every operation so they never disagree.

## What each container is fast at

![A hash map and a linked list are strong and weak at opposite things](diagrams/data-structure-design-notes-complementary.jpg)

This table is the whole topic compressed. Everything below applies it.

| Structure | Fast at | Hopeless at |
|---|---|---|
| \`int[]\` / \`ArrayList\` | index, append, pick a random slot | finding a value, removing from the middle |
| \`HashMap\` | find, insert, delete by key | any question about order |
| Doubly linked list | unlink or insert a node you already hold | finding that node |
| \`PriorityQueue\` (heap) | the smallest or largest | finding or deleting anything else |
| \`TreeMap\` | order, floor, ceiling, range | constant time — it is O(log n) |
| \`LinkedHashSet\` | insertion order plus O(1) membership | ranking, priorities |

"Fast at" and "hopeless at" are complementary across the rows, which is exactly
why pairing works. A \`HashMap\` is hopeless at order; a linked list is good at
order. Put them together, with the map's value being a *pointer into the list*,
and you can find a node in O(1) and then unlink it in O(1) — which neither could
do alone. Have [hash tables](#/dsa/hash-tables/notes) and
[linked list](#/dsa/linked-list/notes) fresh before going further, and
[heaps](#/dsa/heaps/notes) for the priority half.

## The shape

\`\`\`java
class LRU {                       // one lookup + one order
    Map<Integer, Node> index = new HashMap<>();
    Node head, tail;                 // most recent .. least recent
    int get(int k) { Node n = index.get(k); moveToFront(n); return n.val; }
}
\`\`\`

Two fields, two jobs. \`index\` answers "where is key k", and the list answers "in
what order were these touched". Every public method has to update both, and the
bug in nearly every first attempt is a method that updates one and forgets the
other.

The discipline that saves you: before writing anything, write the cost table
down. One row per method, one column for the target cost, one for the structure
that delivers it. If a row has no structure that delivers it, you have not
finished designing — do not start typing.

## LRU cache: a map for the lookup, a list for the order

![A get travelling through the map, into the node, and to the front of the list](diagrams/data-structure-design-notes-lru-pair.jpg)

[LRU Cache](problem:lru-cache) is the question this topic exists for. A cache of
fixed capacity. \`get(key)\` returns the value or \`-1\`. \`put(key, value)\` stores it,
and if that takes you over capacity, the *least recently used* entry is thrown
away. Both operations in O(1).

"Least recently used" is an order, so you need something that keeps an order.
"O(1) \`get\`" is a lookup, so you need a hash map. Recency changes on every single
\`get\`, so the order structure must let you move an item to the front in constant
time — which rules out an \`ArrayList\` (removing from the middle is O(n)) and
rules in a doubly linked list, where a node with both \`prev\` and \`next\` can
unlink itself in three assignments.

\`\`\`text
capacity 2, newest on the left

put(1,1)      index {1}      list  1
put(2,2)      index {1,2}    list  2 1
get(1) -> 1   touch 1        list  1 2      <- 1 moved to the front
put(3,3)      over capacity: the back of the list is 2, so 2 is evicted
              index {1,3}    list  3 1
get(2) -> -1  gone
\`\`\`

Two details make the code short. The list is **doubly** linked, so a node can
unlink itself without a search for its predecessor. And it uses two **sentinel**
nodes — a permanent \`head\` and \`tail\` that hold no data — so there is never a
null check for "was this the first node" or "was this the last one". Every real
node always has a \`prev\` and a \`next\`.

\`\`\`java Lru.java @run-data-structure-design-lru
import java.util.HashMap;
import java.util.Map;

public class Lru {

    /** One cached entry. Doubly linked, so a node can unlink itself. */
    static class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }

    static class Cache {
        private final int capacity;
        private final Map<Integer, Node> index = new HashMap<>();
        private final Node head = new Node(0, 0);   // sentinel, newest side
        private final Node tail = new Node(0, 0);   // sentinel, oldest side

        Cache(int capacity) {
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }

        private void unlink(Node n) {
            n.prev.next = n.next;
            n.next.prev = n.prev;
        }

        private void pushFront(Node n) {
            n.next = head.next;
            n.prev = head;
            head.next.prev = n;
            head.next = n;
        }

        private void touch(Node n) { unlink(n); pushFront(n); }

        int get(int key) {
            Node n = index.get(key);
            if (n == null) return -1;
            touch(n);                // reading counts as using
            return n.val;
        }

        void put(int key, int val) {
            Node n = index.get(key);
            if (n != null) {         // already here: overwrite and touch
                n.val = val;
                touch(n);
                return;
            }
            if (index.size() == capacity) {
                Node oldest = tail.prev;
                unlink(oldest);
                index.remove(oldest.key);   // the map must forget it too
            }
            Node fresh = new Node(key, val);
            index.put(key, fresh);
            pushFront(fresh);
        }

        /** Newest first. Only here so the demo can show the order. */
        String order() {
            StringBuilder sb = new StringBuilder("[");
            for (Node n = head.next; n != tail; n = n.next)
                sb.append(sb.length() > 1 ? " " : "").append(n.key).append('=').append(n.val);
            return sb.append(']').toString();
        }
    }

    public static void main(String[] args) {
        Cache c = new Cache(2);
        c.put(1, 1);
        c.put(2, 2);
        System.out.println("put 1, put 2   " + c.order());
        System.out.println("get(1) = " + c.get(1) + "      " + c.order());
        c.put(3, 3);
        System.out.println("put 3          " + c.order() + "   2 was evicted");
        System.out.println("get(2) = " + c.get(2) + "     gone");
        c.put(1, 11);
        System.out.println("put 1 again    " + c.order() + "   no eviction");
        System.out.println("get(9) = " + c.get(9) + "     never inserted");
    }
}
\`\`\`

\`\`\`output @run-data-structure-design-lru
put 1, put 2   [2=2 1=1]
get(1) = 1      [1=1 2=2]
put 3          [3=3 1=1]   2 was evicted
get(2) = -1     gone
put 1 again    [1=11 3=3]   no eviction
get(9) = -1     never inserted
\`\`\`

The line that people leave out is \`index.remove(oldest.key)\`. Unlink the node and
the list is right, but the map still holds a pointer to a node that is no longer
in the list. The next \`get\` on that key returns a stale value and the cache grows
without limit. Whenever you delete from one structure, ask what the other one
still believes.

### The one-liner, and when to use it

Java's \`LinkedHashMap\` is a hash map that also maintains a linked list of its
entries. Constructed with \`accessOrder\` set to \`true\`, that list is ordered by
*use* rather than by insertion, and there is a protected hook that runs after
every insertion asking whether the oldest entry should go.

\`\`\`java
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // true: order by access, not insertion
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}
\`\`\`

That is a correct, complete LRU cache in nine lines. Say it exists — it shows you
know the library. Then write the long version anyway, because the interviewer is
assessing whether you can build the structure, and \`removeEldestEntry\` answers a
question they did not ask.

## Min Stack: carry the answer alongside

[Min Stack](problem:min-stack) wants \`push\`, \`pop\`, \`top\` and \`getMin\`, all O(1).
\`getMin\` is the awkward one: scanning the stack is O(n), and keeping a single
\`min\` field breaks the moment you pop the minimum, because you have no idea what
the second smallest was.

The fix is the other half of the two-structure idea — instead of two containers,
one container holding two things. Push the value *and the minimum of everything
at or below it*. Popping then discards the old minimum along with the value that
caused it.

\`\`\`text
push 5     stack  (5,5)
push 3     min(3, 5) = 3        (3,3) (5,5)
push 7     min(7, 3) = 3        (7,3) (3,3) (5,5)
pop        -> (3,3) (5,5)       getMin is 3, read straight off the top
pop        -> (5,5)             getMin is 5
\`\`\`

## A queue from two stacks

[Implement Queue using Stacks](problem:implement-queue-using-stacks) looks like a
puzzle and is really a lesson in amortised cost. A stack reverses order. Two
stacks reverse it twice, which is the original order back.

Push onto \`in\`. To pop, if \`out\` is empty, tip everything from \`in\` into \`out\` —
that reversal puts the oldest element on top — then pop from \`out\`. Tipping is
O(n), but each element is tipped **exactly once in its lifetime**, so across any
sequence of operations the average cost per operation is O(1). That is what
*amortised O(1)* means, and it is the phrase the interviewer is listening for.

The mistake is tipping on every pop, or tipping when \`out\` is not empty. Tipping
a non-empty \`out\` puts newer elements underneath older ones and the order breaks.

\`\`\`java Stacked.java @run-data-structure-design-stacked
import java.util.ArrayDeque;
import java.util.Deque;

public class Stacked {

    /** push, pop, top and getMin, every one O(1). */
    static class MinStack {
        // each frame is { value, smallest value at or below this frame }
        private final Deque<int[]> st = new ArrayDeque<>();

        void push(int x) {
            int min = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
            st.push(new int[] { x, min });
        }
        void pop()   { st.pop(); }
        int top()    { return st.peek()[0]; }
        int getMin() { return st.peek()[1]; }
    }

    /** First in, first out, built out of two last-in-first-out stacks. */
    static class QueueFromStacks {
        private final Deque<Integer> in  = new ArrayDeque<>();
        private final Deque<Integer> out = new ArrayDeque<>();

        void push(int x) { in.push(x); }

        /** Tip in into out, but only when out has run dry. */
        private void shift() {
            if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());
        }
        int pop()  { shift(); return out.pop(); }
        int peek() { shift(); return out.peek(); }
        boolean empty() { return in.isEmpty() && out.isEmpty(); }
    }

    public static void main(String[] args) {
        MinStack ms = new MinStack();
        ms.push(5); ms.push(3); ms.push(7);
        System.out.println("top " + ms.top() + "  min " + ms.getMin());
        ms.pop();
        System.out.println("top " + ms.top() + "  min " + ms.getMin());
        ms.pop();
        System.out.println("top " + ms.top() + "  min " + ms.getMin());

        QueueFromStacks q = new QueueFromStacks();
        q.push(1); q.push(2); q.push(3);
        System.out.print("queue order ");
        while (!q.empty()) System.out.print(q.pop() + " ");
        q.push(4);
        System.out.println("\\npeek " + q.peek() + "  empty " + q.empty());
    }
}
\`\`\`

\`\`\`output @run-data-structure-design-stacked
top 7  min 3
top 3  min 3
top 5  min 5
queue order 1 2 3 
peek 4  empty false
\`\`\`

## Random access and O(1) removal

![Removing from the middle of a list by moving the last element into the hole](diagrams/data-structure-design-notes-swap-with-last.jpg)

[Insert Delete GetRandom O(1)](problem:insert-delete-getrandom-o1) asks for a set
with three operations, all constant: insert, remove, and return a uniformly
random member.

A \`HashSet\` gives you the first two and cannot do the third — there is no way to
pick a random element of a hash set without walking it. An \`ArrayList\` gives you
the random pick, since \`list.get(rng.nextInt(size))\` is O(1), and cannot remove a
given value in constant time, because it has to find it first and then shift
everything after it down. So hold both: the \`ArrayList\` stores the values, and
the map stores *where each value lives in the list*.

That leaves the removal shift. The trick is that the list is a set, so **order
does not matter**. To remove the value at index \`i\`, copy the last element into
slot \`i\`, fix that element's entry in the map, then delete the last slot — which
is O(1) because nothing follows it.

\`\`\`text
values [10, 20, 30, 40]      at {10:0, 20:1, 30:2, 40:3}

remove(20):  i = 1, last = 40
             values[1] = 40      -> [10, 40, 30, 40]
             at[40] = 1
             drop the last slot  -> [10, 40, 30]
             at.remove(20)       -> {10:0, 40:1, 30:2}
\`\`\`

\`\`\`java Randomised.java @run-data-structure-design-randomised
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class Randomised {

    static class RandomSet {
        private final List<Integer> values = new ArrayList<>();
        private final Map<Integer, Integer> at = new HashMap<>();  // value -> its index
        private final Random rng = new Random(7);   // fixed seed so the demo repeats

        boolean insert(int v) {
            if (at.containsKey(v)) return false;
            at.put(v, values.size());
            values.add(v);
            return true;
        }

        boolean remove(int v) {
            Integer i = at.get(v);
            if (i == null) return false;
            int last = values.get(values.size() - 1);
            values.set(i, last);                  // last value fills the hole
            at.put(last, i);                      // and the map is told where it went
            values.remove(values.size() - 1);     // O(1): nothing follows it
            at.remove(v);
            return true;
        }

        int getRandom() { return values.get(rng.nextInt(values.size())); }

        int size() { return values.size(); }

        List<Integer> snapshot() { return List.copyOf(values); }
    }

    public static void main(String[] args) {
        RandomSet s = new RandomSet();
        for (int v : new int[] { 10, 20, 30, 40 }) s.insert(v);
        System.out.println("inserted        " + s.snapshot());
        System.out.println("insert(20) again " + s.insert(20) + "   already present");

        s.remove(20);
        System.out.println("after remove 20 " + s.snapshot() + "   40 filled the hole");
        System.out.println("remove(99)      " + s.remove(99) + "  not a member");

        boolean allMembers = true;
        for (int i = 0; i < 6; i++) allMembers &= s.snapshot().contains(s.getRandom());
        System.out.println("six draws all members: " + allMembers + ", size still " + s.size());
    }
}
\`\`\`

\`\`\`output @run-data-structure-design-randomised
inserted        [10, 20, 30, 40]
insert(20) again false   already present
after remove 20 [10, 40, 30]   40 filled the hole
remove(99)      false  not a member
six draws all members: true, size still 3
\`\`\`

\`values.remove(values.size() - 1)\` calls \`remove(int index)\`, not
\`remove(Object)\`. On a \`List<Integer>\` those two overloads are a real hazard —
\`remove(3)\` deletes position 3 and \`remove(Integer.valueOf(3))\` deletes the value
3. Here index removal is what is wanted; elsewhere it has ruined an afternoon.

## Design HashMap from scratch

[Design HashMap](problem:design-hashmap) asks you to build the container the rest
of this page has been using. The point is to say out loud what a hash map is: a
fixed array of buckets, a function turning a key into a bucket number, and a
chain of entries in each bucket for the keys that collide.

- **The bucket count is prime.** \`769\` and \`1009\` are the usual choices. A power
  of two combined with a poor hash function makes low bits collide in patterns; a
  prime spreads them.
- **The index is \`Math.floorMod(key, BUCKETS)\`**, not \`key % BUCKETS\`. In Java the
  \`%\` of a negative number is negative, and a negative array index throws.
- **A collision is a chain**, walked linearly. With a decent spread the chains
  stay short, so \`get\` is O(1) on average and O(n) in the pathological case where
  every key lands in the same bucket. Say the average case *and* the worst case;
  claiming plain O(1) is the answer that gets picked at.

\`\`\`java Buckets.java @run-data-structure-design-buckets
public class Buckets {

    /** One key-value pair, and a link to the next pair in the same bucket. */
    static class Entry {
        final int key;
        int val;
        Entry next;
        Entry(int key, int val, Entry next) { this.key = key; this.val = val; this.next = next; }
    }

    private static final int BUCKETS = 769;      // prime, so keys spread out
    private final Entry[] table = new Entry[BUCKETS];

    private int bucketOf(int key) { return Math.floorMod(key, BUCKETS); }   // negatives are safe

    void put(int key, int val) {
        int b = bucketOf(key);
        for (Entry e = table[b]; e != null; e = e.next)
            if (e.key == key) { e.val = val; return; }   // overwrite, do not duplicate
        table[b] = new Entry(key, val, table[b]);        // new entries go at the front
    }

    int get(int key) {
        for (Entry e = table[bucketOf(key)]; e != null; e = e.next)
            if (e.key == key) return e.val;
        return -1;
    }

    void remove(int key) {
        int b = bucketOf(key);
        Entry prev = null;
        for (Entry e = table[b]; e != null; prev = e, e = e.next) {
            if (e.key != key) continue;
            if (prev == null) table[b] = e.next;   // it was the head of the chain
            else prev.next = e.next;
            return;
        }
    }

    public static void main(String[] args) {
        Buckets m = new Buckets();
        m.put(1, 100);
        m.put(770, 200);        // 770 % 769 == 1, so this collides with key 1
        System.out.println("get(1)    " + m.get(1));
        System.out.println("get(770)  " + m.get(770) + "   same bucket, different key");
        m.put(1, 111);
        System.out.println("overwrite " + m.get(1));
        m.remove(1);
        System.out.println("after remove: get(1) " + m.get(1) + ", get(770) " + m.get(770));
        System.out.println("missing key " + m.get(-5));
    }
}
\`\`\`

\`\`\`output @run-data-structure-design-buckets
get(1)    100
get(770)  200   same bucket, different key
overwrite 111
after remove: get(1) -1, get(770) 200
missing key -1
\`\`\`

Note the collision test. Keys 1 and 770 share a bucket, so removing 1 exercises
the "it was the head of the chain" branch while 770 has to survive. A demo that
never collides does not test the part that is hard.

## LFU cache: three structures, not two

[LFU Cache](problem:lfu-cache) is the same question with a harder eviction rule.
Evict the entry used *least often*, and among equally-used entries, the one used
least recently. It is the standard hard follow-up to LRU.

Now each key has a frequency, so you need three things kept in step:

- \`values\`: key to value.
- \`counts\`: key to how many times it has been touched.
- \`buckets\`: frequency to the set of keys at that frequency, **in recency order**
  — a \`LinkedHashSet\`, which keeps insertion order and still answers membership
  and removal in O(1).

Plus one integer, \`minFreq\`, the smallest frequency currently occupied.

\`\`\`java
class LFUCache {
    private final int capacity;
    private int minFreq = 0;
    private final Map<Integer, Integer> values = new HashMap<>();
    private final Map<Integer, Integer> counts = new HashMap<>();
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();

    /** Move a key from bucket f to bucket f + 1, and mend minFreq if f emptied. */
    private void touch(int key) {
        int f = counts.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty() && minFreq == f) minFreq = f + 1;
        counts.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }
}
\`\`\`

Why \`minFreq\` can be repaired by a single \`+ 1\` is worth sitting with. Frequencies
only ever go up, and only ever by one. So when the bucket at \`minFreq\` empties
because its last key was promoted, the new smallest occupied frequency is exactly
\`minFreq + 1\` — there is nothing in between to have been skipped. A fresh
insertion has frequency 1, so it resets \`minFreq\` to 1. Those two facts are the
whole of the bookkeeping, and they are why LFU is O(1) rather than "scan for the
smallest count".

Eviction reads the first element of \`buckets.get(minFreq)\` — first in a
\`LinkedHashSet\` means least recently added at that frequency, which is precisely
the tie-break the specification asks for.

## What it costs

The method-by-method table is the deliverable. Write it before the code and hand
it over with the code.

| Design | Operation | Cost | What pays for it |
|---|---|---|---|
| LRU | \`get\`, \`put\` | O(1) | map finds the node, list moves it |
| LRU | space | O(capacity) | one node and one map entry per key |
| LFU | \`get\`, \`put\` | O(1) | frequency buckets plus \`minFreq\` |
| Min Stack | \`push\`, \`pop\`, \`top\`, \`getMin\` | O(1) | minimum stored per frame |
| Min Stack | space | O(n) | two ints per element instead of one |
| RandomSet | \`insert\`, \`remove\`, \`getRandom\` | O(1) | list for the pick, map for the index |
| Queue from stacks | \`push\` | O(1) | straight onto \`in\` |
| Queue from stacks | \`pop\`, \`peek\` | O(1) amortised | each element tipped once, ever |
| HashMap | \`put\`, \`get\`, \`remove\` | O(1) average, O(n) worst | short chains, unless every key collides |
| Circular queue | all | O(1) | index arithmetic modulo the capacity |

Two phrases to have ready. *Amortised* means the average over a sequence, and it
is the honest word for the two-stack queue — one pop really does cost O(n), and
it cannot happen twice in a row. *Average case* means over reasonable inputs, and
it is the honest word for a hash map, where an adversary choosing keys can make
every operation linear.

## The mistakes, in the order people make them

1. **Updating one structure and not the other.** Evicting a node from the list
   and leaving its key in the map is the classic. The map hands out a pointer to
   something no longer in the cache, and nothing crashes — it just returns the
   wrong answer.
2. **A singly linked list for LRU,** or no sentinels. Singly linked, you hold the
   node from the map and cannot unlink it, because you do not know its
   predecessor. Without a permanent head and tail, every unlink needs "was this
   the first" and "was this the last" branches, and one of the four is wrong.
3. **Not touching on \`get\`.** In an LRU, reading counts as using. A \`get\` that
   does not move the node to the front evicts entries that were just read.
4. **Forgetting capacity zero,** or a \`put\` of a key already present. Both are in
   the test suite. A duplicate \`put\` overwrites and refreshes — it never evicts.
5. **Shifting an \`ArrayList\` on removal.** \`list.remove(i)\` is O(n). If the design
   promised O(1), swap the last element in instead.
6. **\`remove(int)\` against \`remove(Object)\`.** On a \`List<Integer>\`, \`remove(3)\`
   deletes position 3. To delete the value, write \`remove(Integer.valueOf(3))\`.
7. **\`key % size\` for a bucket index.** Negative keys give a negative index and an
   exception. \`Math.floorMod\`.
8. **Claiming O(1) without saying which kind.** Amortised, average, worst — the
   interviewer is waiting for the qualifier.

## The Java you will reach for

| You want | Write |
|---|---|
| Lookup by key | \`HashMap<K, V>\` — \`get\`, \`put\`, \`containsKey\`, \`remove\` |
| Insert-ordered set, O(1) membership | \`LinkedHashSet<E>\` |
| Access-ordered map with eviction | \`new LinkedHashMap<>(cap, 0.75f, true)\` + \`removeEldestEntry\` |
| Stack or queue or deque | \`ArrayDeque\` — never \`Stack\`, which is synchronised |
| Smallest or largest to hand | \`PriorityQueue<E>\` with a comparator |
| Sorted keys, floor and ceiling | \`TreeMap<K, V>\` — \`floorKey\`, \`ceilingKey\`, \`subMap\` |
| A bucket created on first use | \`map.computeIfAbsent(k, x -> new ArrayList<>())\` |
| Count per key | \`map.merge(k, 1, Integer::sum)\` |
| Non-negative bucket index | \`Math.floorMod(key, BUCKETS)\` |
| A random member of a list | \`list.get(new Random().nextInt(list.size()))\` |

\`Deque\` is the interface to declare and \`ArrayDeque\` the class to build. It gives
you \`push\`/\`pop\`/\`peek\` at the front and \`addLast\`/\`pollLast\` at the back, so one
class covers both stack and queue.

## Working one from the sheet

[Time Based Key-Value Store](problem:time-based-key-value-store): \`set(key, value,
timestamp)\`, then \`get(key, timestamp)\` returns the value that was set at the
largest timestamp at or before the one asked for, or the empty string.

Work the cost table first. \`set\` is called with non-decreasing timestamps, so
appending is enough — O(1). \`get\` is not a lookup, it is a *search for the
largest value at or below*, which no hash map answers. That is a floor query, and
the two structures that answer it are a sorted list plus binary search, or a
\`TreeMap\`.

So: a \`HashMap\` from key to a list of \`(timestamp, value)\` pairs, kept in
timestamp order for free because the input arrives in order, and a binary search
inside the list. The map does the lookup, the list does the ordering, and
[binary search](#/dsa/binary-search/notes) bridges them.

\`\`\`java Timed.java @run-data-structure-design-timed
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Timed {

    /** A record is a small immutable class: these two fields, plus accessors. */
    record Stamped(int time, String value) { }

    static class Store {
        private final Map<String, List<Stamped>> byKey = new HashMap<>();

        void set(String key, String value, int time) {
            byKey.computeIfAbsent(key, k -> new ArrayList<>()).add(new Stamped(time, value));
        }

        String get(String key, int time) {
            List<Stamped> history = byKey.get(key);
            if (history == null) return "";
            int lo = 0, hi = history.size() - 1;
            String answer = "";
            while (lo <= hi) {
                int mid = lo + (hi - lo) / 2;
                if (history.get(mid).time() <= time) {   // a candidate; look for a later one
                    answer = history.get(mid).value();
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
            return answer;
        }
    }

    public static void main(String[] args) {
        Store s = new Store();
        s.set("foo", "bar", 1);
        s.set("foo", "baz", 4);
        System.out.println("t=1  " + s.get("foo", 1));
        System.out.println("t=3  " + s.get("foo", 3) + "   still the value from t=1");
        System.out.println("t=4  " + s.get("foo", 4));
        System.out.println("t=9  " + s.get("foo", 9) + "   nothing later, so t=4 stands");
        System.out.println("t=0  [" + s.get("foo", 0) + "]  nothing at or before 0");
        System.out.println("missing key [" + s.get("nope", 5) + "]");
    }
}
\`\`\`

\`\`\`output @run-data-structure-design-timed
t=1  bar
t=3  bar   still the value from t=1
t=4  baz
t=9  baz   nothing later, so t=4 stands
t=0  []  nothing at or before 0
missing key []
\`\`\`

The search keeps the best candidate seen and carries on to the right. That is the
"largest index satisfying a condition" form of binary search, and writing it as
\`answer = ...; lo = mid + 1\` is more reliable than trying to make the loop land on
the answer by itself.

## How to work through the topic

1. [Design Parking System](problem:design-parking-system) and
   [Design HashSet](problem:design-hashset). Small on purpose. Get into the habit
   of writing the operation-and-cost table before the class body.
2. [Implement Queue using Stacks](problem:implement-queue-using-stacks) and
   [Implement Stack using Queues](problem:implement-stack-using-queues). One
   structure imitating another, and your first amortised argument. Be able to say
   why the tip is O(1) on average.
3. [Design HashMap](problem:design-hashmap) and
   [Design Circular Queue](problem:design-circular-queue). Buckets and chains,
   then index arithmetic modulo the capacity. Both are the internals of things
   you have been using without looking inside.
4. [Min Stack](problem:min-stack) and
   [Peeking Iterator](problem:peeking-iterator). Carrying an extra value
   alongside the data so a query becomes a read rather than a scan.
5. [LRU Cache](problem:lru-cache). The centrepiece. Write it from nothing, with
   sentinels, until it comes out right first time. Then mention \`LinkedHashMap\`.
6. [Insert Delete GetRandom O(1)](problem:insert-delete-getrandom-o1) and
   [Design Underground System](problem:design-underground-system). The swap-with-
   last removal, and a design where the state to hold is "journeys in progress"
   as well as "totals so far".
7. [LFU Cache](problem:lfu-cache),
   [Maximum Frequency Stack](problem:maximum-frequency-stack) and
   [Design Twitter](problem:design-twitter). Three structures at once, and in the
   last one a heap merging feeds. Leave [Snapshot Array](problem:snapshot-array)
   and [Design a Text Editor](problem:design-a-text-editor) until these are
   comfortable — both look easy and both hide a version or cursor problem.
`;export{e as default};