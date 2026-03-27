#!/usr/bin/env python3
"""Generate diverse code→test training pairs for fine-tuning."""
import json, os

EXAMPLES = []

def add(inp, out):
    EXAMPLES.append({"input": inp.strip(), "output": out.strip()})

# ══════════════════════════════════════════════════════════════════
# 1. Python — Basic Math
# ══════════════════════════════════════════════════════════════════
add("""def add(a, b):
    return a + b""",
"""## TEST CASES
- Test case 1: Add two positives | Input: a=2, b=3 | Expected: 5
- Test case 2: Add negative and positive | Input: a=-1, b=5 | Expected: 4
- Test case 3: Add two zeros | Input: a=0, b=0 | Expected: 0

## EDGE CASES
- Edge case 1: Very large numbers | Input: a=10**18, b=10**18 | Expected: 2*10**18
- Edge case 2: Float addition | Input: a=0.1, b=0.2 | Expected: ~0.3 (floating point)
- Edge case 3: None input | Input: a=None, b=5 | Expected: TypeError

## BUGS & FIXES
- Bug 1: No type checking | Fix: Add isinstance check for numeric types
- Bug 2: No overflow handling | Fix: Add bounds checking for very large values""")

# ══════════════════════════════════════════════════════════════════
# 2. Python — Division
# ══════════════════════════════════════════════════════════════════
add("""def divide(a, b):
    return a / b""",
"""## TEST CASES
- Test case 1: Normal division | Input: a=10, b=2 | Expected: 5.0
- Test case 2: Negative division | Input: a=-10, b=2 | Expected: -5.0
- Test case 3: Decimal result | Input: a=7, b=3 | Expected: 2.333...

## EDGE CASES
- Edge case 1: Division by zero | Input: a=5, b=0 | Expected: ZeroDivisionError
- Edge case 2: Zero divided by number | Input: a=0, b=5 | Expected: 0.0
- Edge case 3: Very small divisor | Input: a=1, b=1e-300 | Expected: 1e300

## BUGS & FIXES
- Bug 1: No zero check for divisor | Fix: Add if b == 0: raise ValueError("Cannot divide by zero")
- Bug 2: No input validation | Fix: Validate both inputs are numeric""")

# ══════════════════════════════════════════════════════════════════
# 3. Python — Fibonacci
# ══════════════════════════════════════════════════════════════════
add("""def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)""",
"""## TEST CASES
- Test case 1: Base case 0 | Input: n=0 | Expected: 0
- Test case 2: Base case 1 | Input: n=1 | Expected: 1
- Test case 3: Small n | Input: n=6 | Expected: 8
- Test case 4: Medium n | Input: n=10 | Expected: 55

## EDGE CASES
- Edge case 1: Negative input | Input: n=-1 | Expected: -1 (or error depending on spec)
- Edge case 2: Large n causes stack overflow | Input: n=1000 | Expected: RecursionError
- Edge case 3: Non-integer input | Input: n=3.5 | Expected: TypeError

## BUGS & FIXES
- Bug 1: Exponential time complexity O(2^n) | Fix: Use memoization or iterative approach
- Bug 2: No input validation for negative numbers | Fix: Add if n < 0: raise ValueError""")

# ══════════════════════════════════════════════════════════════════
# 4. Python — Binary Search
# ══════════════════════════════════════════════════════════════════
add("""def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1""",
"""## TEST CASES
- Test case 1: Element exists | Input: arr=[1,3,5,7,9], target=5 | Expected: 2
- Test case 2: First element | Input: arr=[1,3,5], target=1 | Expected: 0
- Test case 3: Last element | Input: arr=[1,3,5], target=5 | Expected: 2
- Test case 4: Not found | Input: arr=[1,3,5], target=4 | Expected: -1

## EDGE CASES
- Edge case 1: Empty array | Input: arr=[], target=1 | Expected: -1
- Edge case 2: Single element found | Input: arr=[5], target=5 | Expected: 0
- Edge case 3: Single element not found | Input: arr=[5], target=3 | Expected: -1

## BUGS & FIXES
- Bug 1: Integer overflow in mid calculation | Fix: Use mid = left + (right - left) // 2
- Bug 2: Unsorted array not handled | Fix: Add validation or document precondition""")

# ══════════════════════════════════════════════════════════════════
# 5. Python — Stack Implementation
# ══════════════════════════════════════════════════════════════════
add("""class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.append(item)
    def pop(self):
        return self.items.pop()
    def peek(self):
        return self.items[-1]
    def is_empty(self):
        return len(self.items) == 0""",
"""## TEST CASES
- Test case 1: Push and pop | Input: push(1), push(2), pop() | Expected: 2
- Test case 2: Peek after push | Input: push(10), peek() | Expected: 10
- Test case 3: Is empty on new stack | Input: is_empty() | Expected: True
- Test case 4: Multiple operations | Input: push(1), push(2), pop(), peek() | Expected: 1

## EDGE CASES
- Edge case 1: Pop from empty stack | Input: pop() on empty | Expected: IndexError
- Edge case 2: Peek on empty stack | Input: peek() on empty | Expected: IndexError
- Edge case 3: Push None value | Input: push(None) | Expected: None stored successfully

## BUGS & FIXES
- Bug 1: No empty check before pop | Fix: Add if self.is_empty(): raise IndexError("Stack is empty")
- Bug 2: No empty check before peek | Fix: Add guard clause for empty stack""")

# ══════════════════════════════════════════════════════════════════
# 6. Python — Palindrome Check
# ══════════════════════════════════════════════════════════════════
add("""def is_palindrome(s):
    return s == s[::-1]""",
"""## TEST CASES
- Test case 1: Palindrome word | Input: s="racecar" | Expected: True
- Test case 2: Non-palindrome | Input: s="hello" | Expected: False
- Test case 3: Single character | Input: s="a" | Expected: True

## EDGE CASES
- Edge case 1: Empty string | Input: s="" | Expected: True
- Edge case 2: Mixed case | Input: s="Racecar" | Expected: False (case-sensitive)
- Edge case 3: Spaces in string | Input: s="race car" | Expected: False

## BUGS & FIXES
- Bug 1: Case sensitivity not handled | Fix: Convert to lowercase before comparing
- Bug 2: Spaces and punctuation not stripped | Fix: Use regex to keep only alphanumeric chars""")

# ══════════════════════════════════════════════════════════════════
# 7. Python — Bubble Sort
# ══════════════════════════════════════════════════════════════════
add("""def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr""",
"""## TEST CASES
- Test case 1: Unsorted array | Input: [64, 34, 25, 12, 22] | Expected: [12, 22, 25, 34, 64]
- Test case 2: Already sorted | Input: [1, 2, 3, 4] | Expected: [1, 2, 3, 4]
- Test case 3: Reverse sorted | Input: [5, 4, 3, 2, 1] | Expected: [1, 2, 3, 4, 5]

## EDGE CASES
- Edge case 1: Empty array | Input: [] | Expected: []
- Edge case 2: Single element | Input: [42] | Expected: [42]
- Edge case 3: Duplicate elements | Input: [3, 1, 3, 1] | Expected: [1, 1, 3, 3]

## BUGS & FIXES
- Bug 1: Mutates original array | Fix: Work on a copy with arr = arr.copy()
- Bug 2: O(n^2) even for sorted input | Fix: Add early exit flag if no swaps in a pass""")

# ══════════════════════════════════════════════════════════════════
# 8. Python — Linked List
# ══════════════════════════════════════════════════════════════════
add("""class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    def length(self):
        count = 0
        current = self.head
        while current:
            count += 1
            current = current.next
        return count""",
"""## TEST CASES
- Test case 1: Append and length | Input: append(1), append(2), length() | Expected: 2
- Test case 2: Empty list length | Input: length() on new list | Expected: 0
- Test case 3: Single element | Input: append(5), length() | Expected: 1

## EDGE CASES
- Edge case 1: Append None | Input: append(None) | Expected: Node with None data, length 1
- Edge case 2: Large number of elements | Input: append 10000 items | Expected: length() returns 10000
- Edge case 3: Append duplicate values | Input: append(1), append(1) | Expected: length 2

## BUGS & FIXES
- Bug 1: No delete method | Fix: Add remove(data) method with pointer manipulation
- Bug 2: O(n) append time | Fix: Maintain a tail pointer for O(1) append""")

# ══════════════════════════════════════════════════════════════════
# 9. JavaScript — Array Flatten
# ══════════════════════════════════════════════════════════════════
add("""function flatten(arr) {
  return arr.reduce((acc, val) =>
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}""",
"""## TEST CASES
- Test case 1: Nested array | Input: [1, [2, [3, 4]], 5] | Expected: [1, 2, 3, 4, 5]
- Test case 2: Already flat | Input: [1, 2, 3] | Expected: [1, 2, 3]
- Test case 3: Deep nesting | Input: [[[[1]]]] | Expected: [1]

## EDGE CASES
- Edge case 1: Empty array | Input: [] | Expected: []
- Edge case 2: Array with null/undefined | Input: [1, null, [2, undefined]] | Expected: [1, null, 2, undefined]
- Edge case 3: Very deep nesting | Input: 1000 levels deep | Expected: Stack overflow risk

## BUGS & FIXES
- Bug 1: Stack overflow on deep nesting | Fix: Use iterative approach with a stack
- Bug 2: No input validation | Fix: Check if input is an array first""")

# ══════════════════════════════════════════════════════════════════
# 10. JavaScript — Debounce
# ══════════════════════════════════════════════════════════════════
add("""function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}""",
"""## TEST CASES
- Test case 1: Single call triggers | Input: debounced(), wait 300ms | Expected: func called once
- Test case 2: Rapid calls debounced | Input: 5 calls in 100ms, delay=200ms | Expected: func called once
- Test case 3: Spaced calls each fire | Input: call, wait 500ms, call (delay=200ms) | Expected: func called twice

## EDGE CASES
- Edge case 1: Zero delay | Input: delay=0 | Expected: func runs on next tick
- Edge case 2: Negative delay | Input: delay=-100 | Expected: Unexpected behavior
- Edge case 3: Function throws error | Input: func that throws | Expected: Error propagated

## BUGS & FIXES
- Bug 1: No input validation for delay | Fix: Add if (delay < 0) throw new Error
- Bug 2: Memory leak if never called | Fix: Add a cancel method to clear the timer""")

# ══════════════════════════════════════════════════════════════════
# 11. JavaScript — Promise Retry
# ══════════════════════════════════════════════════════════════════
add("""async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}""",
"""## TEST CASES
- Test case 1: Success on first try | Input: fn succeeds immediately | Expected: result returned
- Test case 2: Success after 2 failures | Input: fn fails twice then succeeds | Expected: result on 3rd try
- Test case 3: All retries fail | Input: fn always throws | Expected: throws after 3 attempts

## EDGE CASES
- Edge case 1: Zero retries | Input: retries=0 | Expected: Never executes fn
- Edge case 2: Negative retries | Input: retries=-1 | Expected: Never executes fn
- Edge case 3: fn returns null | Input: fn returns null | Expected: null returned (not retried)

## BUGS & FIXES
- Bug 1: retries=0 skips function entirely | Fix: Use retries <= 0 guard with minimum 1
- Bug 2: No exponential backoff | Fix: Use delay * Math.pow(2, i) for backoff""")

# ══════════════════════════════════════════════════════════════════
# 12. JavaScript — Deep Clone
# ══════════════════════════════════════════════════════════════════
add("""function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}""",
"""## TEST CASES
- Test case 1: Simple object | Input: {a: 1, b: 2} | Expected: {a: 1, b: 2} (new ref)
- Test case 2: Nested object | Input: {a: {b: {c: 1}}} | Expected: deep copy
- Test case 3: Array | Input: [1, [2, 3]] | Expected: [1, [2, 3]] (new ref)

## EDGE CASES
- Edge case 1: Null input | Input: null | Expected: null
- Edge case 2: Circular reference | Input: obj.self = obj | Expected: infinite recursion
- Edge case 3: Date/RegExp objects | Input: {d: new Date()} | Expected: loses Date type

## BUGS & FIXES
- Bug 1: No circular reference handling | Fix: Use a WeakMap to track visited objects
- Bug 2: Special objects (Date, RegExp, Map, Set) are not cloned properly | Fix: Add type checks""")

# ══════════════════════════════════════════════════════════════════
# 13. Java — String Reversal
# ══════════════════════════════════════════════════════════════════
add("""public class StringUtils {
    public static String reverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}""",
"""## TEST CASES
- Test case 1: Normal string | Input: "hello" | Expected: "olleh"
- Test case 2: Palindrome | Input: "madam" | Expected: "madam"
- Test case 3: Single char | Input: "a" | Expected: "a"

## EDGE CASES
- Edge case 1: Null input | Input: null | Expected: NullPointerException
- Edge case 2: Empty string | Input: "" | Expected: ""
- Edge case 3: Unicode characters | Input: "héllo" | Expected: "olléh"

## BUGS & FIXES
- Bug 1: No null check | Fix: Add if (s == null) return null or throw IllegalArgumentException
- Bug 2: Surrogate pairs handled incorrectly | Fix: Use codePoints() stream for proper Unicode""")

# ══════════════════════════════════════════════════════════════════
# 14. Java — Singleton Pattern
# ══════════════════════════════════════════════════════════════════
add("""public class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}""",
"""## TEST CASES
- Test case 1: Same instance | Input: getInstance() twice | Expected: same reference
- Test case 2: Not null | Input: getInstance() | Expected: non-null Singleton
- Test case 3: Constructor is private | Input: new Singleton() | Expected: compilation error

## EDGE CASES
- Edge case 1: Multi-threaded access | Input: 2 threads call getInstance() simultaneously | Expected: race condition possible
- Edge case 2: Serialization | Input: serialize and deserialize | Expected: may create second instance
- Edge case 3: Reflection attack | Input: Constructor.newInstance() | Expected: creates second instance

## BUGS & FIXES
- Bug 1: Not thread-safe | Fix: Use synchronized block or double-checked locking
- Bug 2: Broken by serialization | Fix: Implement readResolve() method""")

# ══════════════════════════════════════════════════════════════════
# 15. Python — Matrix Multiply
# ══════════════════════════════════════════════════════════════════
add("""def matrix_multiply(A, B):
    rows_A, cols_A = len(A), len(A[0])
    rows_B, cols_B = len(B), len(B[0])
    result = [[0]*cols_B for _ in range(rows_A)]
    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                result[i][j] += A[i][k] * B[k][j]
    return result""",
"""## TEST CASES
- Test case 1: 2x2 matrices | Input: [[1,2],[3,4]] * [[5,6],[7,8]] | Expected: [[19,22],[43,50]]
- Test case 2: Identity matrix | Input: A * I | Expected: A
- Test case 3: 1x1 matrices | Input: [[3]] * [[4]] | Expected: [[12]]

## EDGE CASES
- Edge case 1: Incompatible dimensions | Input: 2x3 * 4x2 | Expected: IndexError
- Edge case 2: Empty matrix | Input: [] * [] | Expected: IndexError
- Edge case 3: Non-square matrices | Input: 2x3 * 3x2 | Expected: 2x2 result

## BUGS & FIXES
- Bug 1: No dimension validation | Fix: Add assert cols_A == rows_B
- Bug 2: No empty matrix check | Fix: Guard against len(A)==0 or len(B)==0""")

# ══════════════════════════════════════════════════════════════════
# 16. Python — LRU Cache
# ══════════════════════════════════════════════════════════════════
add("""class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.order = []
    def get(self, key):
        if key in self.cache:
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return -1
    def put(self, key, value):
        if key in self.cache:
            self.order.remove(key)
        elif len(self.cache) >= self.capacity:
            oldest = self.order.pop(0)
            del self.cache[oldest]
        self.cache[key] = value
        self.order.append(key)""",
"""## TEST CASES
- Test case 1: Put and get | Input: put(1,1), get(1) | Expected: 1
- Test case 2: Capacity eviction | Input: cap=2, put(1,1), put(2,2), put(3,3), get(1) | Expected: -1
- Test case 3: Update existing key | Input: put(1,1), put(1,10), get(1) | Expected: 10

## EDGE CASES
- Edge case 1: Capacity of 0 | Input: cap=0, put(1,1) | Expected: Immediate eviction
- Edge case 2: Get non-existent key | Input: get(99) | Expected: -1
- Edge case 3: Negative capacity | Input: cap=-1 | Expected: Error or no storage

## BUGS & FIXES
- Bug 1: O(n) removal from order list | Fix: Use OrderedDict for O(1) operations
- Bug 2: No capacity validation | Fix: Add if capacity <= 0: raise ValueError""")

# ══════════════════════════════════════════════════════════════════
# 17. Python — Merge Sort
# ══════════════════════════════════════════════════════════════════
add("""def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result""",
"""## TEST CASES
- Test case 1: Unsorted array | Input: [38, 27, 43, 3, 9] | Expected: [3, 9, 27, 38, 43]
- Test case 2: Already sorted | Input: [1, 2, 3] | Expected: [1, 2, 3]
- Test case 3: Reverse sorted | Input: [5, 4, 3, 2, 1] | Expected: [1, 2, 3, 4, 5]

## EDGE CASES
- Edge case 1: Empty array | Input: [] | Expected: []
- Edge case 2: All same elements | Input: [5, 5, 5] | Expected: [5, 5, 5]
- Edge case 3: Negative numbers | Input: [-3, -1, -2] | Expected: [-3, -2, -1]

## BUGS & FIXES
- Bug 1: Creates many temporary arrays (memory overhead) | Fix: Use in-place merge sort
- Bug 2: Not stable if using < instead of <= | Fix: Ensure <= is used in merge comparison""")

# ══════════════════════════════════════════════════════════════════
# 18. Python — Graph BFS
# ══════════════════════════════════════════════════════════════════
add("""def bfs(graph, start):
    visited = set()
    queue = [start]
    result = []
    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.add(node)
            result.append(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    queue.append(neighbor)
    return result""",
"""## TEST CASES
- Test case 1: Simple graph | Input: {0:[1,2], 1:[3], 2:[3], 3:[]}, start=0 | Expected: [0,1,2,3]
- Test case 2: Single node | Input: {0:[]}, start=0 | Expected: [0]
- Test case 3: Linear graph | Input: {0:[1], 1:[2], 2:[]}, start=0 | Expected: [0,1,2]

## EDGE CASES
- Edge case 1: Disconnected nodes | Input: {0:[1], 2:[3]}, start=0 | Expected: [0,1]
- Edge case 2: Cycle in graph | Input: {0:[1], 1:[0]}, start=0 | Expected: [0,1]
- Edge case 3: Start node not in graph | Input: start=99 | Expected: [99] or empty

## BUGS & FIXES
- Bug 1: Using list as queue is O(n) for pop(0) | Fix: Use collections.deque for O(1) popleft
- Bug 2: No validation if start exists in graph | Fix: Add check for start node""")

# ══════════════════════════════════════════════════════════════════
# 19. Python — Hash Map
# ══════════════════════════════════════════════════════════════════
add("""class HashMap:
    def __init__(self, size=100):
        self.size = size
        self.buckets = [[] for _ in range(size)]
    def _hash(self, key):
        return hash(key) % self.size
    def put(self, key, value):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.buckets[idx]):
            if k == key:
                self.buckets[idx][i] = (key, value)
                return
        self.buckets[idx].append((key, value))
    def get(self, key):
        idx = self._hash(key)
        for k, v in self.buckets[idx]:
            if k == key:
                return v
        return None""",
"""## TEST CASES
- Test case 1: Put and get | Input: put("a", 1), get("a") | Expected: 1
- Test case 2: Update value | Input: put("a", 1), put("a", 2), get("a") | Expected: 2
- Test case 3: Non-existent key | Input: get("z") | Expected: None

## EDGE CASES
- Edge case 1: Hash collision | Input: two keys with same hash | Expected: both stored correctly
- Edge case 2: Empty string key | Input: put("", 1) | Expected: stored successfully
- Edge case 3: None as key | Input: put(None, 1) | Expected: works (hash(None) is valid)

## BUGS & FIXES
- Bug 1: No delete method | Fix: Add remove(key) that finds and removes the tuple
- Bug 2: Fixed size without resizing | Fix: Add load factor check and rehashing""")

# ══════════════════════════════════════════════════════════════════
# 20. Go — HTTP Handler
# ══════════════════════════════════════════════════════════════════
add("""func healthHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}""",
"""## TEST CASES
- Test case 1: GET request | Input: GET /health | Expected: 200, {"status": "ok"}
- Test case 2: POST request | Input: POST /health | Expected: 405 Method Not Allowed
- Test case 3: Content-Type header | Input: GET /health | Expected: Content-Type is application/json

## EDGE CASES
- Edge case 1: HEAD request | Input: HEAD /health | Expected: 405
- Edge case 2: With query params | Input: GET /health?v=1 | Expected: 200 (params ignored)
- Edge case 3: Concurrent requests | Input: 100 simultaneous GETs | Expected: all return 200

## BUGS & FIXES
- Bug 1: No CORS headers | Fix: Add Access-Control-Allow-Origin header
- Bug 2: No request logging | Fix: Add middleware to log method, path, status""")

# ══════════════════════════════════════════════════════════════════
# 21-50: More diverse patterns (compact format)
# ══════════════════════════════════════════════════════════════════

# 21. Python — Decorator pattern
add("""def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper""",
"""## TEST CASES
- Test case 1: Caches result | Input: memoized add(2,3) called twice | Expected: computed once, returns 5 both times
- Test case 2: Different args | Input: add(1,2) then add(3,4) | Expected: 3 then 7
- Test case 3: Works with single arg | Input: square(5) | Expected: 25

## EDGE CASES
- Edge case 1: Unhashable argument (list) | Input: func([1,2]) | Expected: TypeError
- Edge case 2: None as argument | Input: func(None) | Expected: cached correctly
- Edge case 3: Very large cache | Input: 100000 unique calls | Expected: memory grows unbounded

## BUGS & FIXES
- Bug 1: No cache eviction | Fix: Add max size limit with LRU eviction
- Bug 2: Doesn't preserve function metadata | Fix: Use functools.wraps(func)""")

# 22. Python — File reader
add("""def read_csv(filepath):
    results = []
    with open(filepath, 'r') as f:
        headers = f.readline().strip().split(',')
        for line in f:
            values = line.strip().split(',')
            results.append(dict(zip(headers, values)))
    return results""",
"""## TEST CASES
- Test case 1: Normal CSV | Input: file with headers and 2 rows | Expected: list of 2 dicts
- Test case 2: Single row | Input: headers + 1 data row | Expected: list of 1 dict
- Test case 3: Headers match values | Input: "name,age\\nJohn,30" | Expected: [{"name":"John","age":"30"}]

## EDGE CASES
- Edge case 1: File not found | Input: non-existent path | Expected: FileNotFoundError
- Edge case 2: Empty file | Input: empty file | Expected: empty list or error
- Edge case 3: Values with commas | Input: "name\\n\\"John,Jr\\"" | Expected: incorrect split

## BUGS & FIXES
- Bug 1: No proper CSV parsing (quoted fields) | Fix: Use csv.DictReader instead
- Bug 2: No encoding specification | Fix: Add encoding='utf-8' parameter""")

# 23. Python — Trie
add("""class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True
    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.end""",
"""## TEST CASES
- Test case 1: Insert and find | Input: insert("apple"), search("apple") | Expected: True
- Test case 2: Prefix not found | Input: insert("apple"), search("app") | Expected: False
- Test case 3: Word not inserted | Input: search("banana") | Expected: False

## EDGE CASES
- Edge case 1: Empty string | Input: insert(""), search("") | Expected: True
- Edge case 2: Single character | Input: insert("a"), search("a") | Expected: True
- Edge case 3: Unicode characters | Input: insert("café") | Expected: works correctly

## BUGS & FIXES
- Bug 1: No delete method | Fix: Add delete with recursive cleanup of empty nodes
- Bug 2: No startsWith method | Fix: Add prefix search that doesn't check node.end""")

# 24. JavaScript — Event Emitter
add("""class EventEmitter {
  constructor() { this.events = {}; }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }
  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}""",
"""## TEST CASES
- Test case 1: on and emit | Input: on('click', fn), emit('click') | Expected: fn called
- Test case 2: Multiple listeners | Input: on('x', fn1), on('x', fn2), emit('x') | Expected: both called
- Test case 3: off removes listener | Input: on('x', fn), off('x', fn), emit('x') | Expected: fn not called

## EDGE CASES
- Edge case 1: Emit non-existent event | Input: emit('nope') | Expected: no error
- Edge case 2: Off non-existent listener | Input: off('x', unknownFn) | Expected: no error
- Edge case 3: Same listener added twice | Input: on('x', fn), on('x', fn) | Expected: called twice on emit

## BUGS & FIXES
- Bug 1: No once() method | Fix: Add once that auto-removes after first call
- Bug 2: No max listener warning | Fix: Add configurable max listeners limit""")

# 25. JavaScript — Throttle
add("""function throttle(func, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}""",
"""## TEST CASES
- Test case 1: First call executes | Input: throttled(), limit=1000 | Expected: func called
- Test case 2: Rapid calls throttled | Input: 5 calls in 100ms, limit=500 | Expected: func called once
- Test case 3: Call after limit passes | Input: call, wait 1100ms, call, limit=1000 | Expected: func called twice

## EDGE CASES
- Edge case 1: Zero limit | Input: limit=0 | Expected: every call executes
- Edge case 2: Negative limit | Input: limit=-100 | Expected: setTimeout fires immediately
- Edge case 3: Context binding | Input: throttle as method | Expected: this context preserved

## BUGS & FIXES
- Bug 1: Drops trailing call | Fix: Add trailing option to queue last call
- Bug 2: No cancel method | Fix: Add cancel() to clear the timeout""")

# 26. Python — Knapsack (the user's key problem)
add("""def knapsack_memo(weights, values, capacity, n, memo=None):
    if memo is None: memo = {}
    if n == 0 or capacity == 0:
        return 0
    state = (n, capacity)
    if state in memo:
        return memo[state]
    if weights[n-1] <= capacity:
        result = max(
            values[n-1] + knapsack_memo(weights, values, capacity - weights[n-1], n-1, memo),
            knapsack_memo(weights, values, capacity, n-1, memo)
        )
    else:
        result = knapsack_memo(weights, values, capacity, n-1, memo)
    memo[state] = result
    return result""",
"""## TEST CASES
- Test case 1: Standard case | Input: weights=[1,3,4,5], values=[1,4,5,7], capacity=7, n=4 | Expected: 9
- Test case 2: All items fit | Input: weights=[1,1], values=[5,5], capacity=10, n=2 | Expected: 10
- Test case 3: No items fit | Input: weights=[10], values=[100], capacity=5, n=1 | Expected: 0

## EDGE CASES
- Edge case 1: Empty items | Input: weights=[], values=[], capacity=10, n=0 | Expected: 0
- Edge case 2: Zero capacity | Input: capacity=0 | Expected: 0
- Edge case 3: Single item exactly fits | Input: weights=[5], values=[10], capacity=5, n=1 | Expected: 10
- Edge case 4: Negative weights | Input: weights=[-1] | Expected: undefined behavior

## BUGS & FIXES
- Bug 1: Mutable default argument pattern | Fix: Already handled with if memo is None check
- Bug 2: No validation for negative weights/values | Fix: Add input validation""")

# 27. Python — Rate Limiter
add("""import time

class RateLimiter:
    def __init__(self, max_calls, period):
        self.max_calls = max_calls
        self.period = period
        self.calls = []
    def allow(self):
        now = time.time()
        self.calls = [t for t in self.calls if now - t < self.period]
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False""",
"""## TEST CASES
- Test case 1: Under limit | Input: 3 calls, max=5, period=60 | Expected: all return True
- Test case 2: At limit | Input: 5 calls, max=5 | Expected: 5th returns True
- Test case 3: Over limit | Input: 6 calls quickly, max=5 | Expected: 6th returns False

## EDGE CASES
- Edge case 1: Zero max_calls | Input: max_calls=0 | Expected: always returns False
- Edge case 2: Very short period | Input: period=0.001 | Expected: calls expire almost instantly
- Edge case 3: Concurrent access | Input: multi-threaded calls | Expected: race condition possible

## BUGS & FIXES
- Bug 1: Not thread-safe | Fix: Add threading.Lock for concurrent access
- Bug 2: O(n) cleanup each call | Fix: Use deque with timestamps for O(1) removal""")

# 28. Python — JSON Validator
add("""def validate_user(data):
    required = ['name', 'email', 'age']
    for field in required:
        if field not in data:
            return False, f"Missing field: {field}"
    if not isinstance(data['name'], str) or len(data['name']) == 0:
        return False, "Name must be a non-empty string"
    if '@' not in data['email']:
        return False, "Invalid email format"
    if not isinstance(data['age'], int) or data['age'] < 0:
        return False, "Age must be a non-negative integer"
    return True, "Valid" """,
"""## TEST CASES
- Test case 1: Valid input | Input: {"name":"John","email":"j@x.com","age":25} | Expected: (True, "Valid")
- Test case 2: Missing field | Input: {"name":"John"} | Expected: (False, "Missing field: email")
- Test case 3: Invalid email | Input: {"name":"J","email":"bad","age":20} | Expected: (False, "Invalid email format")

## EDGE CASES
- Edge case 1: Age is zero | Input: age=0 | Expected: (True, "Valid")
- Edge case 2: Negative age | Input: age=-5 | Expected: (False, "Age must be...")
- Edge case 3: Extra fields | Input: valid + extra "phone" field | Expected: (True, "Valid") — extras ignored
- Edge case 4: Name is whitespace only | Input: name="   " | Expected: passes (bug—should fail)

## BUGS & FIXES
- Bug 1: Whitespace-only name passes validation | Fix: Add data['name'].strip() check
- Bug 2: Email validation too simple | Fix: Use regex or email-validator library""")

# 29. Go — Goroutine Worker Pool
add("""func workerPool(jobs <-chan int, results chan<- int, numWorkers int) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- job * 2
            }
        }()
    }
    wg.Wait()
    close(results)
}""",
"""## TEST CASES
- Test case 1: Process all jobs | Input: jobs=[1,2,3], workers=2 | Expected: results=[2,4,6]
- Test case 2: Single worker | Input: jobs=[5], workers=1 | Expected: results=[10]
- Test case 3: More workers than jobs | Input: jobs=[1], workers=5 | Expected: results=[1*2]

## EDGE CASES
- Edge case 1: Zero workers | Input: numWorkers=0 | Expected: results channel closed immediately, no processing
- Edge case 2: Empty jobs channel | Input: no jobs sent | Expected: results empty
- Edge case 3: Panic in worker | Input: job causes panic | Expected: goroutine dies, others continue

## BUGS & FIXES
- Bug 1: No error handling in workers | Fix: Add recover() in deferred function
- Bug 2: Results channel not buffered | Fix: Use buffered channel to prevent blocking""")

# 30. C++ — Vector Operations
add("""class Vector2D {
public:
    double x, y;
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}
    Vector2D operator+(const Vector2D& v) const { return {x+v.x, y+v.y}; }
    Vector2D operator-(const Vector2D& v) const { return {x-v.x, y-v.y}; }
    double dot(const Vector2D& v) const { return x*v.x + y*v.y; }
    double magnitude() const { return sqrt(x*x + y*y); }
};""",
"""## TEST CASES
- Test case 1: Addition | Input: (1,2) + (3,4) | Expected: (4,6)
- Test case 2: Subtraction | Input: (5,5) - (2,3) | Expected: (3,2)
- Test case 3: Dot product | Input: (1,0).dot(0,1) | Expected: 0
- Test case 4: Magnitude | Input: (3,4).magnitude() | Expected: 5.0

## EDGE CASES
- Edge case 1: Zero vector | Input: (0,0).magnitude() | Expected: 0.0
- Edge case 2: Negative components | Input: (-1,-1) + (1,1) | Expected: (0,0)
- Edge case 3: Very large values | Input: (1e300, 1e300) | Expected: potential overflow in magnitude

## BUGS & FIXES
- Bug 1: Overflow in magnitude calculation | Fix: Use hypot(x, y) instead of sqrt(x*x + y*y)
- Bug 2: No normalize method | Fix: Add normalize() that returns unit vector""")

# 31-50: Additional compact patterns for breadth
patterns = [
    ("Python — Queue from Stacks", """class QueueFromStacks:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []
    def enqueue(self, item):
        self.in_stack.append(item)
    def dequeue(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
        return self.out_stack.pop()""",
"""## TEST CASES
- Test case 1: Enqueue and dequeue | Input: enqueue(1), enqueue(2), dequeue() | Expected: 1
- Test case 2: FIFO order | Input: enqueue(a,b,c), dequeue 3 times | Expected: a, b, c
- Test case 3: Interleaved operations | Input: enqueue(1), dequeue(), enqueue(2), dequeue() | Expected: 1, 2

## EDGE CASES
- Edge case 1: Dequeue from empty | Input: dequeue() on empty | Expected: IndexError
- Edge case 2: Single element | Input: enqueue(1), dequeue() | Expected: 1

## BUGS & FIXES
- Bug 1: No empty check | Fix: Add if not self.in_stack and not self.out_stack: raise IndexError"""),

    ("Python — Min Heap", """class MinHeap:
    def __init__(self):
        self.heap = []
    def push(self, val):
        self.heap.append(val)
        self._bubble_up(len(self.heap) - 1)
    def pop(self):
        if not self.heap: return None
        self.heap[0], self.heap[-1] = self.heap[-1], self.heap[0]
        val = self.heap.pop()
        self._bubble_down(0)
        return val
    def _bubble_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i] < self.heap[parent]:
                self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
                i = parent
            else: break
    def _bubble_down(self, i):
        n = len(self.heap)
        while 2*i+1 < n:
            smallest = i
            l, r = 2*i+1, 2*i+2
            if l < n and self.heap[l] < self.heap[smallest]: smallest = l
            if r < n and self.heap[r] < self.heap[smallest]: smallest = r
            if smallest != i:
                self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
                i = smallest
            else: break""",
"""## TEST CASES
- Test case 1: Push and pop min | Input: push(3), push(1), push(2), pop() | Expected: 1
- Test case 2: Sorted extraction | Input: push(5,3,8,1), pop all | Expected: 1,3,5,8
- Test case 3: Single element | Input: push(42), pop() | Expected: 42

## EDGE CASES
- Edge case 1: Pop from empty | Input: pop() | Expected: None
- Edge case 2: Duplicate values | Input: push(1,1,1), pop() | Expected: 1

## BUGS & FIXES
- Bug 1: No peek method | Fix: Add peek() that returns self.heap[0] if not empty"""),

    ("JavaScript — Promise.all implementation", """function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(val => {
        results[i] = val;
        completed++;
        if (completed === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}""",
"""## TEST CASES
- Test case 1: All resolve | Input: [Promise(1), Promise(2)] | Expected: [1, 2]
- Test case 2: One rejects | Input: [Promise(1), rejected] | Expected: rejected
- Test case 3: Order preserved | Input: [slow(2), fast(1)] | Expected: [2, 1]

## EDGE CASES
- Edge case 1: Empty array | Input: [] | Expected: never resolves (bug)
- Edge case 2: Non-promise values | Input: [1, 2, 3] | Expected: [1, 2, 3]
- Edge case 3: Single promise | Input: [Promise(42)] | Expected: [42]

## BUGS & FIXES
- Bug 1: Empty array never resolves | Fix: Add if (promises.length === 0) resolve([])
- Bug 2: First rejection wins, but others still run | Fix: Add AbortController support"""),

    ("Java — Binary Tree", """public class BinaryTree {
    int value;
    BinaryTree left, right;
    public BinaryTree(int value) { this.value = value; }
    public void insert(int val) {
        if (val < value) {
            if (left == null) left = new BinaryTree(val);
            else left.insert(val);
        } else {
            if (right == null) right = new BinaryTree(val);
            else right.insert(val);
        }
    }
    public boolean contains(int val) {
        if (val == value) return true;
        if (val < value) return left != null && left.contains(val);
        return right != null && right.contains(val);
    }
}""",
"""## TEST CASES
- Test case 1: Insert and find | Input: insert(5,3,7), contains(3) | Expected: true
- Test case 2: Not found | Input: insert(5), contains(10) | Expected: false
- Test case 3: Root value | Input: insert(5), contains(5) | Expected: true

## EDGE CASES
- Edge case 1: Duplicate values | Input: insert(5,5) | Expected: goes to right subtree
- Edge case 2: Sorted insert (degenerate tree) | Input: insert(1,2,3,4,5) | Expected: linked list shape
- Edge case 3: Single node | Input: tree with just root | Expected: contains(root) is true

## BUGS & FIXES
- Bug 1: No balancing (skewed tree = O(n) ops) | Fix: Use AVL or Red-Black tree
- Bug 2: No delete method | Fix: Implement delete with 3 cases"""),

    ("Python — Async HTTP Client", """import aiohttp
import asyncio

async def fetch_urls(urls):
    results = {}
    async with aiohttp.ClientSession() as session:
        for url in urls:
            try:
                async with session.get(url) as resp:
                    results[url] = await resp.text()
            except Exception as e:
                results[url] = str(e)
    return results""",
"""## TEST CASES
- Test case 1: Single URL success | Input: ["https://httpbin.org/get"] | Expected: dict with response
- Test case 2: Multiple URLs | Input: 3 valid URLs | Expected: dict with 3 entries
- Test case 3: Invalid URL | Input: ["https://invalid.test"] | Expected: error string in result

## EDGE CASES
- Edge case 1: Empty URL list | Input: [] | Expected: empty dict
- Edge case 2: Timeout | Input: very slow server | Expected: timeout error
- Edge case 3: 500 status code | Input: server returns 500 | Expected: response body still captured

## BUGS & FIXES
- Bug 1: Sequential fetching (not concurrent) | Fix: Use asyncio.gather with list of coroutines
- Bug 2: No timeout configuration | Fix: Add aiohttp.ClientTimeout"""),

    ("Python — Password Validator", """import re

def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append("Must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("Must contain uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("Must contain lowercase letter")
    if not re.search(r'[0-9]', password):
        errors.append("Must contain a digit")
    if not re.search(r'[!@#$%^&*]', password):
        errors.append("Must contain a special character")
    return len(errors) == 0, errors""",
"""## TEST CASES
- Test case 1: Valid password | Input: "Str0ng!Pass" | Expected: (True, [])
- Test case 2: Too short | Input: "Ab1!" | Expected: (False, ["Must be at least 8 characters"])
- Test case 3: Missing uppercase | Input: "password1!" | Expected: (False, [...])

## EDGE CASES
- Edge case 1: Empty string | Input: "" | Expected: (False, [all errors])
- Edge case 2: Only spaces | Input: "        " | Expected: (False, missing uppercase, etc.)
- Edge case 3: Unicode characters | Input: "Pässwörd1!" | Expected: depends on regex

## BUGS & FIXES
- Bug 1: Limited special characters set | Fix: Expand regex to include more symbols
- Bug 2: No max length check | Fix: Add upper bound to prevent DoS with huge strings"""),

    ("Python — Retry Decorator", """import time
import functools

def retry(max_retries=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator""",
"""## TEST CASES
- Test case 1: Success on first try | Input: func that succeeds | Expected: returns result, 1 call
- Test case 2: Success after retry | Input: func fails once then succeeds | Expected: returns result, 2 calls
- Test case 3: All retries fail | Input: func always raises | Expected: raises after max_retries

## EDGE CASES
- Edge case 1: max_retries=0 | Input: func that fails | Expected: raises immediately (no calls)
- Edge case 2: max_retries=1 | Input: func that fails | Expected: raises after 1 attempt
- Edge case 3: Different exception types | Input: ValueError then TypeError | Expected: retries all

## BUGS & FIXES
- Bug 1: max_retries=0 enters loop but range(0) skips | Fix: Document or handle edge case
- Bug 2: Fixed delay (no backoff) | Fix: Add exponential backoff option"""),

    ("JavaScript — LocalStorage Wrapper", """class Storage {
  get(key) {
    const val = localStorage.getItem(key);
    try { return JSON.parse(val); }
    catch { return val; }
  }
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  remove(key) {
    localStorage.removeItem(key);
  }
  clear() {
    localStorage.clear();
  }
}""",
"""## TEST CASES
- Test case 1: Set and get object | Input: set("user", {name:"John"}), get("user") | Expected: {name:"John"}
- Test case 2: Get non-existent | Input: get("missing") | Expected: null
- Test case 3: Remove key | Input: set("x",1), remove("x"), get("x") | Expected: null

## EDGE CASES
- Edge case 1: Store undefined | Input: set("k", undefined) | Expected: stores "undefined" string
- Edge case 2: Circular reference | Input: set("k", circularObj) | Expected: TypeError from JSON.stringify
- Edge case 3: localStorage full | Input: exceed 5MB limit | Expected: QuotaExceededError

## BUGS & FIXES
- Bug 1: No error handling for QuotaExceeded | Fix: Try-catch around setItem
- Bug 2: No expiry mechanism | Fix: Store {value, expiry} and check on get"""),

    ("Python — Graph DFS", """def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    result = [start]
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    return result""",
"""## TEST CASES
- Test case 1: Simple graph | Input: {1:[2,3], 2:[4], 3:[], 4:[]}, start=1 | Expected: [1,2,4,3]
- Test case 2: Single node | Input: {1:[]}, start=1 | Expected: [1]
- Test case 3: Linear path | Input: {1:[2], 2:[3], 3:[]}, start=1 | Expected: [1,2,3]

## EDGE CASES
- Edge case 1: Cycle | Input: {1:[2], 2:[1]}, start=1 | Expected: [1,2] (no infinite loop)
- Edge case 2: Disconnected graph | Input: {1:[2], 3:[4]}, start=1 | Expected: [1,2]
- Edge case 3: Start not in graph | Input: start=99 | Expected: [99]

## BUGS & FIXES
- Bug 1: Mutable default argument | Fix: Already handled with if visited is None
- Bug 2: Deep recursion on large graphs | Fix: Use iterative DFS with explicit stack"""),

    ("Python — Topological Sort", """def topological_sort(graph):
    visited = set()
    stack = []
    def dfs(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(node)
    for node in graph:
        if node not in visited:
            dfs(node)
    return stack[::-1]""",
"""## TEST CASES
- Test case 1: DAG | Input: {A:[B,C], B:[D], C:[D], D:[]} | Expected: valid topological order
- Test case 2: Linear | Input: {1:[2], 2:[3], 3:[]} | Expected: [1,2,3]
- Test case 3: Independent nodes | Input: {A:[], B:[], C:[]} | Expected: any order

## EDGE CASES
- Edge case 1: Empty graph | Input: {} | Expected: []
- Edge case 2: Cycle in graph | Input: {A:[B], B:[A]} | Expected: infinite recursion (bug)
- Edge case 3: Single node | Input: {A:[]} | Expected: [A]

## BUGS & FIXES
- Bug 1: No cycle detection | Fix: Add recursion stack tracking to detect back edges
- Bug 2: RecursionError on large graphs | Fix: Use iterative approach with Kahn's algorithm"""),
]

for name, code, output in patterns:
    add(code, output)

# ══════════════════════════════════════════════════════════════════
# Save
# ══════════════════════════════════════════════════════════════════
out_dir = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.join(out_dir, "dataset.jsonl")

# Deduplicate by input
seen = set()
unique = []
for ex in EXAMPLES:
    key = ex["input"].strip()
    if key not in seen:
        seen.add(key)
        unique.append(ex)

with open(out_path, "w") as f:
    for ex in unique:
        f.write(json.dumps(ex) + "\n")

print(f"Generated {len(unique)} unique training examples → {out_path}")
