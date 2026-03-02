/**
 * Comprehensive Interview Questions Database
 * Real interview questions and answers from top tech companies
 * Organized by technology and category
 */

export interface InterviewQuestion {
  id: string
  question: string
  category: 'technical' | 'behavioral' | 'situational' | 'system-design' | 'coding'
  difficulty: 'easy' | 'medium' | 'hard'
  technology?: string
  tags: string[]
  answer: string
  tips: string
  sampleAnswer?: string
  followUpQuestions?: string[]
}

// JavaScript Interview Questions
export const javascriptQuestions: InterviewQuestion[] = [
  {
    id: 'js-1',
    question: 'What is the difference between == and === in JavaScript?',
    category: 'technical',
    difficulty: 'easy',
    technology: 'JavaScript',
    tags: ['basics', 'operators', 'comparison'],
    answer: 'The == operator performs type coercion before comparison, while === compares both value and type without coercion. For example, 5 == "5" returns true, but 5 === "5" returns false.',
    tips: 'Always use === for predictable comparisons unless you explicitly need type coercion.',
    sampleAnswer: '// == allows type coercion\nconsole.log(5 == "5");  // true\nconsole.log(null == undefined);  // true\n\n// === strict comparison\nconsole.log(5 === "5");  // false\nconsole.log(null === undefined);  // false',
    followUpQuestions: ['What are the edge cases with ==?', 'When would you use == over ===?']
  },
  {
    id: 'js-2',
    question: 'Explain closures in JavaScript with an example.',
    category: 'technical',
    difficulty: 'medium',
    technology: 'JavaScript',
    tags: ['closures', 'scope', 'functions'],
    answer: 'A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned. Closures are created every time a function is created.',
    tips: 'Closures are useful for data privacy, creating factory functions, and maintaining state in asynchronous operations.',
    sampleAnswer: 'function createCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getCount: () => count\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment()); // 1\nconsole.log(counter.increment()); // 2\nconsole.log(counter.getCount()); // 2',
    followUpQuestions: ['What are common use cases for closures?', 'How do closures affect memory?']
  },
  {
    id: 'js-3',
    question: 'What is the event loop in JavaScript?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'JavaScript',
    tags: ['async', 'event-loop', 'concurrency'],
    answer: 'The event loop is JavaScript\'s mechanism for handling asynchronous operations. It continuously checks the call stack and task queue. When the stack is empty, it pushes the first task from the queue to the stack for execution.',
    tips: 'Understand the difference between macro-tasks (setTimeout, setInterval) and micro-tasks (Promises, queueMicrotask).',
    sampleAnswer: 'console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("Promise");\n});\n\nconsole.log("End");\n\n// Output: Start, End, Promise, Timeout',
    followUpQuestions: ['What\'s the difference between microtask and macrotask queues?', 'How does the event loop handle Promises vs setTimeout?']
  },
  {
    id: 'js-4',
    question: 'What is hoisting in JavaScript?',
    category: 'technical',
    difficulty: 'easy',
    technology: 'JavaScript',
    tags: ['hoisting', 'variables', 'functions'],
    answer: 'Hoisting is JavaScript\'s default behavior of moving declarations to the top of the current scope. Variable declarations using var are hoisted and initialized as undefined, while let and const are hoisted but not initialized (temporal dead zone).',
    tips: 'Function declarations are fully hoisted, but function expressions are not.',
    sampleAnswer: '// Variable hoisting\nconsole.log(x); // undefined (var is hoisted)\nvar x = 5;\n\n// Function hoisting\ngreet(); // "Hello" (function declaration is hoisted)\nfunction greet() { console.log("Hello"); }\n\n// Function expression NOT hoisted\nsayHi(); // TypeError\nvar sayHi = () => console.log("Hi");',
    followUpQuestions: ['How does hoisting differ between var, let, and const?', 'Why does the temporal dead zone exist?']
  },
  {
    id: 'js-5',
    question: 'Explain the difference between let, const, and var.',
    category: 'technical',
    difficulty: 'easy',
    technology: 'JavaScript',
    tags: ['variables', 'scope', 'es6'],
    answer: 'var has function scope and is hoisted with undefined value. let has block scope and is hoisted but not initialized (TDZ). const has block scope, cannot be reassigned, and must be initialized at declaration.',
    tips: 'Use const by default, let when you need to reassign, and avoid var in modern JavaScript.',
    sampleAnswer: '// var - function scoped, hoisted\nvar x = 1;\n\n// let - block scoped, not hoisted\nlet y = 2;\nif (true) {\n  let y = 3; // Different variable\n}\n\n// const - block scoped, immutable binding\nconst z = 3;\n// z = 4; // TypeError\nconst obj = { a: 1 };\nobj.a = 2; // Allowed (object mutation)',
    followUpQuestions: ['Can you mutate a const object?', 'What is the temporal dead zone?']
  },
  {
    id: 'js-6',
    question: 'What are Promises and how do they work?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'JavaScript',
    tags: ['async', 'promises', 'es6'],
    answer: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation. It has three states: pending, fulfilled, or rejected. Promises allow chaining with .then() and error handling with .catch().',
    tips: 'Use async/await for cleaner asynchronous code, but understand Promises underneath.',
    sampleAnswer: 'const fetchData = () => {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      resolve({ data: "Success" });\n    }, 1000);\n  });\n};\n\n// Promise chaining\nfetchData()\n  .then(result => console.log(result))\n  .catch(error => console.error(error));\n\n// async/await\nasync function getData() {\n  try {\n    const result = await fetchData();\n    console.log(result);\n  } catch (error) {\n    console.error(error);\n  }\n}',
    followUpQuestions: ['What is Promise.all() and when would you use it?', 'How do you handle multiple Promises?']
  },
  {
    id: 'js-7',
    question: 'What is the difference between null and undefined?',
    category: 'technical',
    difficulty: 'easy',
    technology: 'JavaScript',
    tags: ['basics', 'types', 'values'],
    answer: 'undefined means a variable has been declared but not assigned a value. null is an intentional absence of any value, explicitly assigned by the developer. typeof undefined is "undefined", while typeof null is "object" (a known bug).',
    tips: 'Use null when you want to explicitly indicate "no value". undefined usually means something hasn\'t been initialized.',
    sampleAnswer: 'let x;\nconsole.log(x); // undefined\n\nlet y = null;\nconsole.log(y); // null\n\nconsole.log(typeof undefined); // "undefined"\nconsole.log(typeof null); // "object" (bug in JS)',
    followUpQuestions: ['Why is typeof null "object"?', 'When should you use null vs undefined?']
  },
  {
    id: 'js-8',
    question: 'Explain the "this" keyword in JavaScript.',
    category: 'technical',
    difficulty: 'medium',
    technology: 'JavaScript',
    tags: ['this', 'context', 'functions'],
    answer: '"this" refers to the object that is executing the current function. Its value depends on how the function is called: in regular functions, it\'s the global object (or undefined in strict mode); in methods, it\'s the calling object; in arrow functions, it\'s lexically bound.',
    tips: 'Arrow functions don\'t have their own "this" - they inherit from the enclosing scope.',
    sampleAnswer: 'const obj = {\n  name: "John",\n  greet() {\n    console.log(this.name); // "John"\n  },\n  greetArrow: () => {\n    console.log(this.name); // undefined (lexical this)\n  }\n};\n\nconst greet = obj.greet;\ngreet(); // undefined (this is lost)\n\nconst boundGreet = obj.greet.bind(obj);\nboundGreet(); // "John"',
    followUpQuestions: ['How do bind(), call(), and apply() differ?', 'Why doesn\'t arrow function have its own this?']
  }
]

// React Interview Questions
export const reactQuestions: InterviewQuestion[] = [
  {
    id: 'react-1',
    question: 'What is the Virtual DOM and how does React use it?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'React',
    tags: ['virtual-dom', 'rendering', 'performance'],
    answer: 'The Virtual DOM is a lightweight JavaScript representation of the real DOM. React creates a virtual DOM tree, and when state changes, it creates a new tree and compares (diffs) it with the previous one. Only the differences are applied to the real DOM, minimizing expensive DOM operations.',
    tips: 'Understanding Virtual DOM helps explain why React is performant and how reconciliation works.',
    sampleAnswer: '// React creates virtual DOM nodes\nconst vnode = {\n  type: \'div\',\n  props: { className: \'container\' },\n  children: [\n    { type: \'h1\', props: {}, children: \'Hello\' }\n  ]\n};\n\n// React diffing algorithm:\n// 1. Compare element types\n// 2. Compare attributes/props\n// 3. Recursively process children\n// 4. Only update changed parts in real DOM',
    followUpQuestions: ['What is reconciliation?', 'How does React\'s diffing algorithm work?']
  },
  {
    id: 'react-2',
    question: 'What are React Hooks and why were they introduced?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'React',
    tags: ['hooks', 'useState', 'useEffect'],
    answer: 'Hooks are functions that let you use state and other React features in functional components. They were introduced to solve problems with class components: wrapper hell, huge components, confusing lifecycle methods, and inability to share logic between components.',
    tips: 'Common hooks include useState, useEffect, useContext, useRef, useMemo, and useCallback.',
    sampleAnswer: 'function Counter() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() => {\n    document.title = `Count: ${count}`;\n    return () => {\n      // Cleanup function\n    };\n  }, [count]);\n  \n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}',
    followUpQuestions: ['What are the rules of hooks?', 'How do you create a custom hook?']
  },
  {
    id: 'react-3',
    question: 'Explain the useState and useEffect hooks.',
    category: 'technical',
    difficulty: 'easy',
    technology: 'React',
    tags: ['hooks', 'state', 'side-effects'],
    answer: 'useState returns a stateful value and a function to update it. useEffect performs side effects in function components - it runs after render and can optionally clean up. useEffect accepts a dependency array to control when it runs.',
    tips: 'Always include all dependencies in the useEffect dependency array to avoid stale closures.',
    sampleAnswer: 'function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    setLoading(true);\n    \n    fetchUser(userId)\n      .then(data => setUser(data))\n      .finally(() => setLoading(false));\n    \n    // Cleanup function (optional)\n    return () => {\n      // Cancel pending requests\n    };\n  }, [userId]); // Dependency array\n  \n  if (loading) return <div>Loading...</div>;\n  return <div>{user.name}</div>;\n}',
    followUpQuestions: ['When does useEffect run?', 'How do you clean up effects?']
  },
  {
    id: 'react-4',
    question: 'What is the difference between useEffect and useLayoutEffect?',
    category: 'technical',
    difficulty: 'hard',
    technology: 'React',
    tags: ['hooks', 'rendering', 'timing'],
    answer: 'useEffect runs asynchronously after React has committed changes to the DOM. useLayoutEffect runs synchronously after all DOM mutations but before the browser paints. useLayoutEffect is useful for measuring DOM or making DOM changes that need to happen before paint.',
    tips: 'Use useEffect for most cases. Use useLayoutEffect only when you need to measure or modify the DOM before paint.',
    sampleAnswer: 'function MeasureElement() {\n  const ref = useRef();\n  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });\n  \n  // useLayoutEffect runs before browser paint\n  useLayoutEffect(() => {\n    if (ref.current) {\n      setDimensions({\n        width: ref.current.offsetWidth,\n        height: ref.current.offsetHeight\n      });\n    }\n  }, []);\n  \n  return <div ref={ref}>{/* content */}</div>;\n}',
    followUpQuestions: ['When would you use useLayoutEffect?', 'What problems can useLayoutEffect cause?']
  },
  {
    id: 'react-5',
    question: 'What are controlled and uncontrolled components in React?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'React',
    tags: ['forms', 'state', 'controlled'],
    answer: 'Controlled components have their value controlled by React state. The component receives its current value through props and notifies changes through callbacks. Uncontrolled components maintain their own internal state, accessed via refs.',
    tips: 'Use controlled components for validation and transformation. Use uncontrolled for simple forms or file inputs.',
    sampleAnswer: '// Controlled component\nfunction ControlledInput() {\n  const [value, setValue] = useState(\'\');\n  return (\n    <input\n      value={value}\n      onChange={e => setValue(e.target.value)}\n    />\n  );\n}\n\n// Uncontrolled component\nfunction UncontrolledInput() {\n  const inputRef = useRef();\n  \n  const handleSubmit = () => {\n    console.log(inputRef.current.value);\n  };\n  \n  return <input ref={inputRef} />;\n}',
    followUpQuestions: ['When should you use controlled vs uncontrolled?', 'How do you handle file inputs in React?']
  },
  {
    id: 'react-6',
    question: 'What is React Context and when should you use it?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'React',
    tags: ['context', 'state-management', 'prop-drilling'],
    answer: 'Context provides a way to pass data through the component tree without manually passing props at every level. It\'s designed for sharing global data like themes, user info, or locale. Context should be used for low-frequency updates, not for high-frequency state changes.',
    tips: 'Context causes re-renders of all consumers. Split context for different concerns to minimize re-renders.',
    sampleAnswer: 'const ThemeContext = createContext(\'light\');\n\nfunction App() {\n  return (\n    <ThemeContext.Provider value="dark">\n      <Toolbar />\n    </ThemeContext.Provider>\n  );\n}\n\nfunction Toolbar() {\n  const theme = useContext(ThemeContext);\n  return <div>Current theme: {theme}</div>;\n}',
    followUpQuestions: ['What are the performance implications of Context?', 'How do you prevent unnecessary re-renders with Context?']
  },
  {
    id: 'react-7',
    question: 'Explain useMemo and useCallback with examples.',
    category: 'technical',
    difficulty: 'medium',
    technology: 'React',
    tags: ['hooks', 'performance', 'memoization'],
    answer: 'useMemo memoizes a computed value, only recalculating when dependencies change. useCallback memoizes a function reference, preventing unnecessary re-renders when passing callbacks to child components. Both are performance optimizations.',
    tips: 'Don\'t optimize prematurely. Use these hooks when you have actual performance issues or expensive calculations.',
    sampleAnswer: 'function ExpensiveComponent({ items, onItemClick }) {\n  // Memoize expensive calculation\n  const sortedItems = useMemo(() => {\n    return items.slice().sort((a, b) => a.name.localeCompare(b.name));\n  }, [items]);\n  \n  // Memoize callback\n  const handleClick = useCallback((id) => {\n    onItemClick(id);\n  }, [onItemClick]);\n  \n  return (\n    <ul>\n      {sortedItems.map(item => (\n        <li key={item.id} onClick={() => handleClick(item.id)}>\n          {item.name}\n        </li>\n      ))}\n    </ul>\n  );\n}',
    followUpQuestions: ['When should you use useMemo?', 'How does useCallback differ from useMemo?']
  }
]

// Node.js Interview Questions
export const nodejsQuestions: InterviewQuestion[] = [
  {
    id: 'node-1',
    question: 'What is the event loop in Node.js and how does it work?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Node.js',
    tags: ['event-loop', 'async', 'architecture'],
    answer: 'The event loop is the core of Node.js\'s asynchronous non-blocking I/O. It handles asynchronous operations by offloading tasks to the system kernel and executing callbacks when operations complete. The loop has multiple phases: timers, pending callbacks, idle/prepare, poll, check, and close callbacks.',
    tips: 'Understanding the event loop phases helps debug async issues and optimize performance.',
    sampleAnswer: 'Event Loop Phases:\n1. Timers: execute setTimeout/setInterval callbacks\n2. Pending Callbacks: execute I/O callbacks deferred\n3. Idle/Prepare: internal use\n4. Poll: retrieve new I/O events\n5. Check: execute setImmediate callbacks\n6. Close Callbacks: execute close callbacks\n\nsetTimeout(() => console.log("timer"), 0);\nsetImmediate(() => console.log("immediate"));\n// In I/O phase, immediate runs first\n// In main module, order is non-deterministic',
    followUpQuestions: ['What are the phases of the event loop?', 'What\'s the difference between setTimeout and setImmediate?']
  },
  {
    id: 'node-2',
    question: 'What is the difference between process.nextTick and setImmediate?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Node.js',
    tags: ['event-loop', 'async', 'timing'],
    answer: 'process.nextTick executes callbacks immediately after the current operation completes, before the event loop continues. setImmediate executes callbacks in the check phase of the event loop. nextTick has higher priority and can starve I/O if used excessively.',
    tips: 'Use nextTick for immediate cleanup after an operation. Use setImmediate for breaking up long-running operations.',
    sampleAnswer: 'console.log("start");\n\nprocess.nextTick(() => {\n  console.log("nextTick");\n});\n\nsetImmediate(() => {\n  console.log("immediate");\n});\n\nPromise.resolve().then(() => {\n  console.log("promise");\n});\n\nconsole.log("end");\n\n// Output: start, end, nextTick, promise, immediate',
    followUpQuestions: ['Can process.nextTick cause I/O starvation?', 'When would you use each?']
  },
  {
    id: 'node-3',
    question: 'How does Node.js handle child processes?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Node.js',
    tags: ['child-process', 'cluster', 'performance'],
    answer: 'Node.js provides child_process module with four methods: spawn (stream-based), exec (buffered output), execFile (direct file execution), and fork (Node.js processes). For clustering, use the cluster module to create multiple worker processes that share the same port.',
    tips: 'Use spawn for large data streams, exec for small outputs, fork for Node.js workers, and cluster for utilizing multiple CPU cores.',
    sampleAnswer: 'const { spawn, fork, cluster } = require(\'child_process\');\n\n// Spawn a process\nconst ls = spawn(\'ls\', [\'-la\']);\nls.stdout.on(\'data\', (data) => console.log(data.toString()))\n\n// Fork a Node.js process\nconst worker = fork(\'./worker.js\');\nworker.send({ task: \'process\' });\n\n// Clustering\nif (cluster.isMaster) {\n  const cpuCount = require(\'os\').cpus().length;\n  for (let i = 0; i < cpuCount; i++) {\n    cluster.fork();\n  }\n}',
    followUpQuestions: ['What\'s the difference between spawn and exec?', 'How does the cluster module work?']
  },
  {
    id: 'node-4',
    question: 'Explain streams in Node.js and their types.',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Node.js',
    tags: ['streams', 'i/o', 'performance'],
    answer: 'Streams are objects for handling streaming data. There are four types: Readable (for reading), Writable (for writing), Duplex (both), and Transform (modify data in transit). Streams help process large data efficiently without loading everything into memory.',
    tips: 'Use streams for file operations, HTTP requests, and any large data processing to avoid memory issues.',
    sampleAnswer: 'const fs = require(\'fs\');\nconst { Transform } = require(\'stream\');\n\n// Readable stream\nconst readStream = fs.createReadStream(\'input.txt\');\n\n// Writable stream\nconst writeStream = fs.createWriteStream(\'output.txt\');\n\n// Transform stream\nconst upperCase = new Transform({\n  transform(chunk, encoding, callback) {\n    this.push(chunk.toString().toUpperCase());\n    callback();\n  }\n});\n\n// Pipe streams together\nreadStream\n  .pipe(upperCase)\n  .pipe(writeStream);',
    followUpQuestions: ['What are the benefits of streams?', 'How do you handle backpressure?']
  },
  {
    id: 'node-5',
    question: 'What is middleware in Express.js?',
    category: 'technical',
    difficulty: 'easy',
    technology: 'Node.js',
    tags: ['express', 'middleware', 'routing'],
    answer: 'Middleware functions have access to req, res, and the next middleware function. They can execute code, modify req/res, end the response, or call next(). Middleware is executed in the order it\'s added. Types include application-level, router-level, error-handling, and built-in middleware.',
    tips: 'Always call next() in middleware unless you want to end the request-response cycle.',
    sampleAnswer: 'const express = require(\'express\');\nconst app = express();\n\n// Application-level middleware\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.path}`);\n  next();\n});\n\n// Router-level middleware\nconst auth = (req, res, next) => {\n  if (req.headers.authorization) {\n    next();\n  } else {\n    res.status(401).send(\'Unauthorized\');\n  }\n};\n\napp.get(\'/protected\', auth, (req, res) => {\n  res.send(\'Protected content\');\n});\n\n// Error-handling middleware\napp.use((err, req, res, next) => {\n  res.status(500).json({ error: err.message });\n});',
    followUpQuestions: ['How do you create error-handling middleware?', 'What\'s the difference between app.use and router.use?']
  }
]

// Python Interview Questions
export const pythonQuestions: InterviewQuestion[] = [
  {
    id: 'py-1',
    question: 'What is the difference between a list and a tuple in Python?',
    category: 'technical',
    difficulty: 'easy',
    technology: 'Python',
    tags: ['data-structures', 'list', 'tuple'],
    answer: 'Lists are mutable (can be modified after creation), tuples are immutable (cannot be changed). Lists use square brackets [], tuples use parentheses (). Tuples are faster and can be used as dictionary keys. Lists have more built-in methods.',
    tips: 'Use tuples for fixed collections, lists for collections that need to change.',
    sampleAnswer: '# List - mutable\nmy_list = [1, 2, 3]\nmy_list.append(4)  # OK\nmy_list[0] = 10    # OK\n\n# Tuple - immutable\nmy_tuple = (1, 2, 3)\n# my_tuple.append(4)  # AttributeError\n# my_tuple[0] = 10    # TypeError\n\n# Tuple as dict key (works)\nd = {(1, 2): "value"}\n\n# List as dict key (fails)\n# d = {[1, 2]: "value"}  # TypeError',
    followUpQuestions: ['When would you use a tuple over a list?', 'Can tuples contain mutable objects?']
  },
  {
    id: 'py-2',
    question: 'Explain decorators in Python with an example.',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Python',
    tags: ['decorators', 'functions', 'advanced'],
    answer: 'Decorators are functions that modify the behavior of other functions or classes. They wrap another function, allowing you to execute code before and after the wrapped function runs. Common uses include logging, timing, authentication, and caching.',
    tips: 'Decorators use the @decorator_name syntax. Remember to use functools.wraps to preserve function metadata.',
    sampleAnswer: 'from functools import wraps\nimport time\n\ndef timer(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.time() - start:.2f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    time.sleep(1)\n    return "Done"\n\n# Equivalent to: slow_function = timer(slow_function)\nprint(slow_function())  # slow_function took 1.00s\n# Done',
    followUpQuestions: ['How do you create a decorator with arguments?', 'What are class decorators?']
  },
  {
    id: 'py-3',
    question: 'What are generators in Python and how do they differ from regular functions?',
    category: 'technical',
    difficulty: 'medium',
    technology: 'Python',
    tags: ['generators', 'yield', 'memory'],
    answer: 'Generators are functions that use yield to return values one at a time, pausing execution between yields. They maintain state between calls and generate values on-demand (lazy evaluation). This makes them memory-efficient for large datasets.',
    tips: 'Use generators when dealing with large datasets or infinite sequences to save memory.',
    sampleAnswer: '# Generator function\ndef countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\n# Using the generator\nfor i in countdown(5):\n    print(i)  # 5, 4, 3, 2, 1\n\n# Generator expression (similar to list comprehension)\nsquares = (x**2 for x in range(10))\n\n# Memory comparison\nimport sys\nmy_list = [x for x in range(1000)]\nmy_gen = (x for x in range(1000))\nprint(sys.getsizeof(my_list))  # ~8856 bytes\nprint(sys.getsizeof(my_gen))   # ~112 bytes',
    followUpQuestions: ['What is the difference between yield and return?', 'How do you create an infinite generator?']
  },
  {
    id: 'py-4',
    question: 'Explain list, dictionary, and set comprehensions with examples.',
    category: 'technical',
    difficulty: 'easy',
    technology: 'Python',
    tags: ['comprehensions', 'syntax', 'idiomatic'],
    answer: 'Comprehensions provide a concise way to create collections. List comprehensions create lists, dictionary comprehensions create dictionaries, and set comprehensions create sets. They can include conditions for filtering.',
    tips: 'Comprehensions are more readable and often faster than equivalent for loops.',
    sampleAnswer: '# List comprehension\nsquares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Dictionary comprehension\nnames = [\'alice\', \'bob\', \'charlie\']\nname_lengths = {name: len(name) for name in names}\n# {\'alice\': 5, \'bob\': 3, \'charlie\': 7}\n\n# Set comprehension\nunique_lengths = {len(name) for name in names}\n# {3, 5, 7}\n\n# Nested comprehension\nmatrix = [[i*j for j in range(3)] for i in range(3)]\n# [[0, 0, 0], [0, 1, 2], [0, 2, 4]]',
    followUpQuestions: ['When should you avoid comprehensions?', 'Can comprehensions have multiple conditions?']
  },
  {
    id: 'py-5',
    question: 'What is the Global Interpreter Lock (GIL) in Python?',
    category: 'technical',
    difficulty: 'hard',
    technology: 'Python',
    tags: ['gil', 'threading', 'performance'],
    answer: 'The GIL is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously. It exists because CPython\'s memory management is not thread-safe. This means multi-threaded Python programs cannot fully utilize multiple CPU cores for CPU-bound tasks.',
    tips: 'Use multiprocessing for CPU-bound tasks, threading for I/O-bound tasks, or consider alternative implementations like PyPy or Jython.',
    sampleAnswer: 'import threading\nimport multiprocessing\nimport time\n\ndef cpu_bound_task(n):\n    return sum(i * i for i in range(n))\n\n# Threading - won\'t utilize multiple cores due to GIL\nstart = time.time()\nthreads = []\nfor _ in range(4):\n    t = threading.Thread(target=cpu_bound_task, args=(10**6,))\n    threads.append(t); t.start()\nfor t in threads: t.join()\nprint(f"Threading: {time.time() - start:.2f}s")\n\n# Multiprocessing - bypasses GIL\nstart = time.time()\nwith multiprocessing.Pool(4) as p:\n    p.map(cpu_bound_task, [10**6] * 4)\nprint(f"Multiprocessing: {time.time() - start:.2f}s")',
    followUpQuestions: ['How do you work around the GIL?', 'When does the GIL not affect performance?']
  }
]

// System Design Questions
export const systemDesignQuestions: InterviewQuestion[] = [
  {
    id: 'sd-1',
    question: 'How would you design a URL shortener like bit.ly?',
    category: 'system-design',
    difficulty: 'medium',
    technology: 'System Design',
    tags: ['url-shortener', 'hashing', 'scalability'],
    answer: 'A URL shortener needs: 1) A hash function to generate short codes (base62 encoding of IDs or random strings), 2) Database to store mappings (NoSQL for scale), 3) Redirect service (301/302), 4) Analytics for tracking, 5) Caching for popular URLs, 6) Rate limiting to prevent abuse.',
    tips: 'Consider trade-offs: hash collisions, length of short URL, custom aliases, analytics requirements, and expiration policies.',
    sampleAnswer: 'Architecture:\n1. Client sends long URL to API Gateway\n2. API Gateway -> Load Balancer -> URL Service\n3. URL Service:\n   - Generate unique ID (distributed ID generator like Snowflake)\n   - Encode ID to base62 (a-z, A-Z, 0-9)\n   - Store in database: {short_code, long_url, created_at, expiry}\n   - Cache in Redis for fast lookups\n4. Redirect Flow:\n   - Check Redis cache first\n   - If miss, query database\n   - Return 301 redirect\n   - Log analytics event\n\nDatabase Schema:\n- short_code (PK)\n- long_url (indexed)\n- created_at\n- expires_at\n- user_id (optional)',
    followUpQuestions: ['How do you handle hash collisions?', 'How would you add analytics?']
  },
  {
    id: 'sd-2',
    question: 'Design a rate limiter for an API.',
    category: 'system-design',
    difficulty: 'medium',
    technology: 'System Design',
    tags: ['rate-limiter', 'algorithms', 'distributed'],
    answer: 'Rate limiters control request rates. Common algorithms: 1) Token Bucket (tokens replenish over time), 2) Sliding Window (track requests in time window), 3) Leaky Bucket (process at constant rate). For distributed systems, use Redis with Lua scripts for atomic operations.',
    tips: 'Consider: rate limit per user/IP/API key, different limits for different endpoints, handling bursts, and graceful degradation.',
    sampleAnswer: '// Token Bucket Algorithm (Node.js + Redis)\nconst rateLimit = async (userId, limit, window) => {\n  const key = `ratelimit:${userId}`;\n  const now = Date.now();\n  \n  const luaScript = `\n    local tokens = redis.call("LLEN", KEYS[1])\n    if tokens < tonumber(ARGV[1]) then\n      redis.call("RPUSH", KEYS[1], ARGV[2])\n      return 1\n    end\n    return 0\n  `;\n  \n  const allowed = await redis.eval(luaScript, [key], [limit, now]);\n  \n  if (!allowed) {\n    throw new Error("Rate limit exceeded");\n  }\n};',
    followUpQuestions: ['How do you handle distributed rate limiting?', 'What\'s the difference between hard and soft limits?']
  },
  {
    id: 'sd-3',
    question: 'Design a real-time chat application like WhatsApp.',
    category: 'system-design',
    difficulty: 'hard',
    technology: 'System Design',
    tags: ['chat', 'websockets', 'real-time'],
    answer: 'A chat app needs: 1) WebSocket connections for real-time messaging, 2) Message queue for async processing, 3) Database for message persistence, 4) Push notifications for offline users, 5) End-to-end encryption, 6) Presence service for online status. Scale with connection pooling and sharding.',
    tips: 'Consider message ordering, delivery receipts, read receipts, media handling, and cross-device sync.',
    sampleAnswer: 'Architecture:\n1. Connection Layer:\n   - WebSocket servers for real-time connections\n   - Connection manager tracks user connections\n   - Heartbeat for connection health\n\n2. Message Flow:\n   - Sender -> WebSocket -> Message Service\n   - Message Service -> Message Queue (Kafka)\n   - Consumer -> Push to recipient\'s WebSocket\n   - Store in database (Cassandra/DynamoDB)\n\n3. Database Schema:\n   - messages: {message_id, chat_id, sender_id, content, timestamp}\n   - chats: {chat_id, participants, last_message}\n   - user_presence: {user_id, status, last_seen}',
    followUpQuestions: ['How do you ensure message ordering?', 'How would you implement group chats?']
  },
  {
    id: 'sd-4',
    question: 'Design a scalable notification system.',
    category: 'system-design',
    difficulty: 'medium',
    technology: 'System Design',
    tags: ['notifications', 'pub-sub', 'scaling'],
    answer: 'A notification system needs: 1) Multiple channels (email, push, SMS, in-app), 2) Template engine for personalization, 3) Priority queue for different notification types, 4) Retry mechanism with exponential backoff, 5) Rate limiting per user, 6) Analytics for tracking delivery and engagement.',
    tips: 'Consider deduplication, batching, user preferences, and handling failures gracefully.',
    sampleAnswer: 'Architecture:\n\n1. API Layer:\n   - Notification API accepts notification requests\n   - Validates and routes to appropriate queue\n\n2. Queue System:\n   - High priority: security alerts, OTPs\n   - Medium priority: messages, mentions\n   - Low priority: marketing, updates\n\n3. Workers:\n   - Email Worker (SendGrid, SES)\n   - Push Worker (FCM, APNs)\n   - SMS Worker (Twilio)\n   - In-App Worker (WebSocket)',
    followUpQuestions: ['How do you handle notification preferences?', 'How would you prevent notification spam?']
  }
]

// Behavioral Questions
export const behavioralQuestions: InterviewQuestion[] = [
  {
    id: 'beh-1',
    question: 'Tell me about a time you had to work with a difficult team member.',
    category: 'behavioral',
    difficulty: 'medium',
    tags: ['teamwork', 'conflict', 'communication'],
    answer: 'Use the STAR method: Describe the Situation, your Task, the Action you took, and the Result. Focus on how you approached the situation professionally, communicated effectively, and found a constructive solution.',
    tips: 'Stay positive, focus on resolution, and show emotional intelligence. Never badmouth the difficult person.',
    sampleAnswer: 'S: At my previous job, I worked with a developer who consistently missed deadlines and was resistant to feedback.\n\nT: I needed to ensure our project stayed on track while maintaining team harmony.\n\nA: I scheduled a one-on-one to understand their challenges. I learned they were overwhelmed with unclear requirements. I suggested we break tasks into smaller chunks with clear acceptance criteria. I also paired them with a senior developer for mentorship.\n\nR: Their on-time delivery improved by 40% over the next sprint. They became more open to feedback, and the team dynamic improved significantly.',
    followUpQuestions: ['What would you do differently?', 'How did this affect team dynamics?']
  },
  {
    id: 'beh-2',
    question: 'Describe a challenging project you worked on and how you overcame obstacles.',
    category: 'behavioral',
    difficulty: 'medium',
    tags: ['problem-solving', 'challenges', 'achievements'],
    answer: 'Choose a project with clear challenges and measurable outcomes. Explain the technical or business challenges, your approach to solving them, and the positive impact of your solution.',
    tips: 'Focus on YOUR contributions, not just the team\'s. Quantify results when possible.',
    sampleAnswer: 'S: We needed to migrate a legacy monolith to microservices with zero downtime, but the system had 50+ services with undocumented dependencies.\n\nT: As lead developer, I needed to create a migration strategy that wouldn\'t disrupt users.\n\nA: I proposed a strangler fig pattern approach. I:\n1. Created a service dependency map using log analysis\n2. Started with low-risk services and created API gateways\n3. Implemented canary deployments for each migration\n4. Set up monitoring and automated rollback\n\nR: We migrated all services over 6 months with 99.9% uptime. Response time improved by 60%.',
    followUpQuestions: ['What was the biggest technical challenge?', 'How did you handle pushback?']
  },
  {
    id: 'beh-3',
    question: 'Tell me about a time you made a mistake at work.',
    category: 'behavioral',
    difficulty: 'medium',
    tags: ['mistakes', 'growth', 'accountability'],
    answer: 'Choose a real mistake, take ownership, explain what you learned, and show how you prevented similar issues. This demonstrates self-awareness and growth mindset.',
    tips: 'Be honest but not overly negative. Focus on learning and prevention, not dwelling on the mistake.',
    sampleAnswer: 'S: Early in my career, I pushed a database migration directly to production without proper testing. It caused a 30-minute outage during peak hours.\n\nT: I needed to fix the immediate issue and prevent this from happening again.\n\nA: I immediately:\n1. Rolled back the migration\n2. Communicated transparently with stakeholders\n3. Stayed late to help affected customers\n4. Proposed a new deployment process with staging environments and peer reviews\n5. Created a deployment checklist that\'s still used today\n\nR: The recovery was smooth. The new process reduced deployment issues by 80%.',
    followUpQuestions: ['How did your team react?', 'What systems did you put in place?']
  },
  {
    id: 'beh-4',
    question: 'Describe a time you had to learn a new technology quickly.',
    category: 'behavioral',
    difficulty: 'easy',
    tags: ['learning', 'adaptability', 'growth'],
    answer: 'Show your learning process, resources you used, and how you applied the new knowledge. Demonstrate adaptability and growth mindset.',
    tips: 'Show structured learning approach and practical application. Mention resources and methods.',
    sampleAnswer: 'S: Our team needed to build a real-time feature, but none of us had experience with WebSockets.\n\nT: I needed to learn WebSocket implementation in 3 days to deliver the feature on time.\n\nA: My learning approach:\n1. Read official documentation and MDN guides\n2. Built a small proof-of-concept on the first day\n3. Watched conference talks on WebSocket scaling\n4. Set up Socket.io and tested with simulated load\n5. Documented learnings for the team\n\nR: Delivered the feature on time. It handled 10,000 concurrent connections at launch.',
    followUpQuestions: ['What resources did you use?', 'How do you stay updated?']
  },
  {
    id: 'beh-5',
    question: 'How do you handle tight deadlines and pressure?',
    category: 'behavioral',
    difficulty: 'medium',
    tags: ['time-management', 'stress', 'prioritization'],
    answer: 'Describe your time management strategies, prioritization methods, and how you maintain quality under pressure. Show you can remain calm and focused.',
    tips: 'Mention specific tools or methods (Pomodoro, Eisenhower Matrix). Show you know when to escalate or push back.',
    sampleAnswer: 'My approach to tight deadlines:\n\n1. Prioritize ruthlessly: I use the Eisenhower Matrix to identify critical tasks and deprioritize nice-to-haves.\n\n2. Communicate early: If a deadline is unrealistic, I raise concerns immediately with alternatives.\n\n3. Break it down: I decompose work into small, trackable tasks with mini-deadlines.\n\n4. Focus time: I block "deep work" hours and minimize meetings during crunch time.\n\n5. Quality gates: Even under pressure, I maintain code reviews and basic testing.',
    followUpQuestions: ['When do you push back on deadlines?', 'How do you prevent burnout?']
  }
]

// Combine all questions
export const allInterviewQuestions: InterviewQuestion[] = [
  ...javascriptQuestions,
  ...reactQuestions,
  ...nodejsQuestions,
  ...pythonQuestions,
  ...systemDesignQuestions,
  ...behavioralQuestions
]

// Get questions by technology
export function getQuestionsByTechnology(technology: string): InterviewQuestion[] {
  return allInterviewQuestions.filter(q => 
    q.technology?.toLowerCase() === technology.toLowerCase()
  )
}

// Get questions by category
export function getQuestionsByCategory(category: string): InterviewQuestion[] {
  return allInterviewQuestions.filter(q => 
    q.category.toLowerCase() === category.toLowerCase()
  )
}

// Get questions by tags
export function getQuestionsByTags(tags: string[]): InterviewQuestion[] {
  return allInterviewQuestions.filter(q => 
    tags.some(tag => q.tags.some(qTag => 
      qTag.toLowerCase().includes(tag.toLowerCase())
    ))
  )
}

// Get random questions
export function getRandomQuestions(count: number, filters?: {
  technology?: string
  category?: string
  difficulty?: string
}): InterviewQuestion[] {
  let filtered = allInterviewQuestions
  
  if (filters?.technology) {
    filtered = filtered.filter(q => 
      q.technology?.toLowerCase() === filters.technology!.toLowerCase()
    )
  }
  
  if (filters?.category) {
    filtered = filtered.filter(q => 
      q.category.toLowerCase() === filters.category!.toLowerCase()
    )
  }
  
  if (filters?.difficulty) {
    filtered = filtered.filter(q => 
      q.difficulty === filters.difficulty
    )
  }
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Get questions based on job title/skills
export function getQuestionsForJob(jobTitle: string, skills: string[]): InterviewQuestion[] {
  const jobLower = jobTitle.toLowerCase()
  const skillLower = skills.map(s => s.toLowerCase())
  
  // Determine relevant technologies
  const relevantTechs: string[] = []
  
  if (jobLower.includes('frontend') || jobLower.includes('react') || skillLower.includes('react')) {
    relevantTechs.push('React', 'JavaScript')
  }
  if (jobLower.includes('backend') || jobLower.includes('node')) {
    relevantTechs.push('Node.js', 'System Design')
  }
  if (jobLower.includes('full') || jobLower.includes('fullstack')) {
    relevantTechs.push('React', 'JavaScript', 'Node.js', 'System Design')
  }
  if (jobLower.includes('python') || skillLower.includes('python')) {
    relevantTechs.push('Python')
  }
  if (jobLower.includes('senior') || jobLower.includes('lead') || jobLower.includes('architect')) {
    relevantTechs.push('System Design')
  }
  
  // Always include behavioral
  relevantTechs.push('Behavioral')
  
  // Get questions for relevant technologies
  const questions = relevantTechs.flatMap(tech => 
    getQuestionsByTechnology(tech).slice(0, 3)
  )
  
  // Shuffle and return unique questions
  return [...new Map(questions.map(q => [q.id, q])).values()]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
}

export default allInterviewQuestions
