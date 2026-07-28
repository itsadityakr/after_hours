var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The one idea

- The question names a class and lists operations with a time limit on each.
- No single container meets every limit, so hold **two** and keep them in step.
- Write the operation-and-cost table before the code. That table is what is
  being assessed.
- Whenever you delete from one structure, ask what the other still believes.

## Which container for which cost

| Need | Reach for |
|---|---|
| Find by key, O(1) | \`HashMap\` |
| An order you can splice, O(1) | doubly linked list with sentinels |
| Smallest or largest, O(log n) | \`PriorityQueue\` |
| Floor, ceiling, range | \`TreeMap\` |
| Random member, O(1) | \`ArrayList\` plus a value-to-index map |
| Insertion order and O(1) membership | \`LinkedHashSet\` |

## The pairings worth memorising

![The LRU pairing: a hash map for lookup and a linked list for recency](diagrams/data-structure-design-revision-lru-pair.jpg)

- **LRU** = \`HashMap\` (key to node) + doubly linked list (recency). Touch on
  \`get\` as well as \`put\`.
- **LFU** = values map + counts map + \`Map<freq, LinkedHashSet<key>>\` + a
  \`minFreq\` int. Frequencies only rise by one, so an emptied \`minFreq\` becomes
  \`minFreq + 1\`; a fresh insert resets it to 1.
- **Min Stack** = one stack of \`{value, min at or below}\`. \`getMin\` is a read.
- **Insert/Delete/GetRandom** = \`ArrayList\` + value-to-index map. Remove by
  copying the last element over the hole, fixing its index, dropping the tail.
- **Queue from two stacks** = push onto \`in\`; when \`out\` empties, tip \`in\` into
  it. Never tip a non-empty \`out\`.
- **HashMap** = prime bucket count, \`Math.floorMod(key, BUCKETS)\`, a chain per
  bucket, new entries at the head.

## The skeleton

\`\`\`java
class LRU {
    Map<Integer, Node> index = new HashMap<>();
    Node head, tail;                     // sentinels: newest .. oldest
    int get(int k) {
        Node n = index.get(k);
        if (n == null) return -1;
        unlink(n); pushFront(n);         // reading counts as using
        return n.val;
    }
    void put(int k, int v) {
        // present: overwrite and touch. Full: unlink tail.prev AND index.remove
        // its key. Then insert at the front.
    }
}
\`\`\`

## Costs, and the qualifier

| Design | Operation | Cost |
|---|---|---|
| LRU, LFU, Min Stack, RandomSet | every listed one | O(1) |
| Queue from two stacks | \`pop\`, \`peek\` | O(1) amortised — tipped once, ever |
| Own HashMap | \`get\`, \`put\` | O(1) average, O(n) worst |
| Time-based store | \`get\` | O(log n), binary search on the history |

Say which kind of O(1) you mean. Amortised is an average over a sequence;
average case is over reasonable inputs. Bare "O(1)" invites the follow-up.

## The bugs

![Evicting from the list but leaving the key in the map](diagrams/data-structure-design-revision-stale-map.jpg)

- Node evicted from the list but its key left in the map — stale reads, unbounded
  growth.
- Singly linked list for LRU: you hold the node and cannot unlink it.
- No sentinels, so four null branches and one of them is wrong.
- \`get\` that does not refresh recency.
- Capacity zero, and \`put\` of a key already present (overwrite, never evict).
- \`list.remove(i)\` from the middle is O(n) — swap in the last element instead.
- \`remove(3)\` on a \`List<Integer>\` deletes index 3. Value needs
  \`remove(Integer.valueOf(3))\`.
- \`key % BUCKETS\` is negative for negative keys. \`Math.floorMod\`.

## The API

| Want | Write |
|---|---|
| Library LRU | \`new LinkedHashMap<>(cap, 0.75f, true)\` + override \`removeEldestEntry\` |
| Bucket on first use | \`map.computeIfAbsent(k, x -> new ArrayList<>())\` |
| Count per key | \`map.merge(k, 1, Integer::sum)\` |
| Stack or queue | \`Deque<E> d = new ArrayDeque<>()\` — not \`Stack\` |
| Floor query | \`treeMap.floorKey(t)\` / \`floorEntry(t)\` |
| Safe bucket index | \`Math.floorMod(key, BUCKETS)\` |

Mention \`LinkedHashMap\` with \`removeEldestEntry\` for LRU, then write the long
version — the interviewer asked for the structure, not the library call.
`;export{e as default};