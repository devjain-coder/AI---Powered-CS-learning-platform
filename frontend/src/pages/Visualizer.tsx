import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Zap,
  HelpCircle,
  Volume2,
  VolumeX,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

type Language = 'cpp' | 'java' | 'python' | 'javascript';
type AlgorithmKey = 'bubble' | 'selection' | 'insertion' | 'binarySearch';

interface VisualizerFrame {
  array: number[];
  comparing: number[];
  swapped: number[];
  sorted: number[];
  activeLine: number;
  explanation: string;
  variableDiff?: { varName: string; prev: string; next: string }[];
}

interface AlgorithmCode {
  lines: string[];
  lineExplanations: Record<number, string>;
}

const ALGORITHM_CODES: Record<AlgorithmKey, Record<Language, AlgorithmCode>> = {
  bubble: {
    java: {
      lines: [
        'for (int i = 0; i < n - 1; i++) {',
        '    for (int j = 0; j < n - i - 1; j++) {',
        '        if (arr[j] > arr[j + 1]) {',
        '            int temp = arr[j];',
        '            arr[j] = arr[j + 1];',
        '            arr[j + 1] = temp;',
        '        }',
        '    }',
        '}',
      ],
      lineExplanations: {
        1: 'Outer pass counter i (controls how many elements are settled at end).',
        2: 'Inner loop compares adjacent elements up to unsorted boundary.',
        3: 'Compares adjacent pair: if left is greater, swap is required.',
        4: 'Saves current element into temp buffer for swap.',
        5: 'Overwrites left position with smaller right value.',
        6: 'Places temp into right position to finish swap.',
      },
    },
    cpp: {
      lines: [
        'for (int i = 0; i < n - 1; ++i) {',
        '    for (int j = 0; j < n - i - 1; ++j) {',
        '        if (arr[j] > arr[j + 1]) {',
        '            std::swap(arr[j], arr[j + 1]);',
        '        }',
        '    }',
        '}',
      ],
      lineExplanations: {
        1: 'Outer pass loop over array elements.',
        2: 'Scans adjacent elements in current unsorted subarray.',
        3: 'Evaluates if arr[j] > arr[j+1] condition holds true.',
        4: 'Swaps the two elements using std::swap.',
      },
    },
    python: {
      lines: [
        'for i in range(n - 1):',
        '    for j in range(n - i - 1):',
        '        if arr[j] > arr[j + 1]:',
        '            arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      ],
      lineExplanations: {
        1: 'Iterates pass count i across range(0, n-1).',
        2: 'Iterates inner index j up to current unsorted partition.',
        3: 'Checks if arr[j] exceeds arr[j+1].',
        4: 'Performs simultaneous tuple swap in Python.',
      },
    },
    javascript: {
      lines: [
        'for (let i = 0; i < n - 1; i++) {',
        '  for (let j = 0; j < n - i - 1; j++) {',
        '    if (arr[j] > arr[j + 1]) {',
        '      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
        '    }',
        '  }',
        '}',
      ],
      lineExplanations: {
        1: 'Outer iteration for tracking sorted tail.',
        2: 'Inner pointer j walking adjacent pairs.',
        3: 'Compares arr[j] against arr[j+1].',
        4: 'Destructuring array swap in JavaScript.',
      },
    },
  },
  selection: {
    java: {
      lines: [
        'for (int i = 0; i < n - 1; i++) {',
        '    int minIdx = i;',
        '    for (int j = i + 1; j < n; j++) {',
        '        if (arr[j] < arr[minIdx]) minIdx = j;',
        '    }',
        '    int temp = arr[minIdx];',
        '    arr[minIdx] = arr[i];',
        '    arr[i] = temp;',
        '}',
      ],
      lineExplanations: {
        1: 'Sets boundary for sorted prefix.',
        2: 'Assumes current index i holds the minimum value.',
        3: 'Scans remaining unsorted elements to find true minimum.',
        4: 'Updates minIdx whenever a smaller element is discovered.',
        6: 'Swaps found minimum element into index i.',
      },
    },
    cpp: {
      lines: [
        'for (int i = 0; i < n - 1; ++i) {',
        '    int minIdx = i;',
        '    for (int j = i + 1; j < n; ++j) {',
        '        if (arr[j] < arr[minIdx]) minIdx = j;',
        '    }',
        '    std::swap(arr[i], arr[minIdx]);',
        '}',
      ],
      lineExplanations: {
        1: 'Iterates boundary of sorted prefix.',
        2: 'Initializes minIdx to current index i.',
        3: 'Searches for smaller elements from i+1 to n.',
        4: 'Updates minIdx to current minimum position.',
        6: 'Swaps element at i with the minimum element found.',
      },
    },
    python: {
      lines: [
        'for i in range(n - 1):',
        '    min_idx = i',
        '    for j in range(i + 1, n):',
        '        if arr[j] < arr[min_idx]:',
        '            min_idx = j',
        '    arr[i], arr[min_idx] = arr[min_idx], arr[i]',
      ],
      lineExplanations: {
        1: 'Loop across unsorted prefix.',
        2: 'Designates index i as candidate minimum.',
        3: 'Loops through remaining elements.',
        4: 'Finds index of minimum element.',
        6: 'Swaps minimum element into current index.',
      },
    },
    javascript: {
      lines: [
        'for (let i = 0; i < n - 1; i++) {',
        '  let minIdx = i;',
        '  for (let j = i + 1; j < n; j++) {',
        '    if (arr[j] < arr[minIdx]) minIdx = j;',
        '  }',
        '  [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
        '}',
      ],
      lineExplanations: {
        1: 'Selects target position i for minimum element.',
        2: 'Initializes minIdx tracker.',
        3: 'Finds the lowest value index in remaining array.',
        4: 'Updates minIdx upon smaller value encounter.',
        6: 'Swaps lowest element into slot i.',
      },
    },
  },
  insertion: {
    java: {
      lines: [
        'for (int i = 1; i < n; ++i) {',
        '    int key = arr[i];',
        '    int j = i - 1;',
        '    while (j >= 0 && arr[j] > key) {',
        '        arr[j + 1] = arr[j];',
        '        j = j - 1;',
        '    }',
        '    arr[j + 1] = key;',
        '}',
      ],
      lineExplanations: {
        1: 'Picks elements starting from index 1 to insert.',
        2: 'Stores current element as key to be placed.',
        3: 'Initializes j to previous index.',
        4: 'Shifts elements greater than key to one position ahead.',
        8: 'Inserts key into its correct sorted location.',
      },
    },
    cpp: {
      lines: [
        'for (int i = 1; i < n; ++i) {',
        '    int key = arr[i];',
        '    int j = i - 1;',
        '    while (j >= 0 && arr[j] > key) {',
        '        arr[j + 1] = arr[j];',
        '        j--;',
        '    }',
        '    arr[j + 1] = key;',
        '}',
      ],
      lineExplanations: {
        1: 'Iterates through unsorted portion.',
        2: 'Holds the element to be inserted into sorted prefix.',
        4: 'Moves elements greater than key one position right.',
        8: 'Places key into vacated position.',
      },
    },
    python: {
      lines: [
        'for i in range(1, len(arr)):',
        '    key = arr[i]',
        '    j = i - 1',
        '    while j >= 0 and arr[j] > key:',
        '        arr[j + 1] = arr[j]',
        '        j -= 1',
        '    arr[j + 1] = key',
      ],
      lineExplanations: {
        1: 'Iterates through array starting from index 1.',
        2: 'Saves current item into key.',
        4: 'Shifts elements right while they are greater than key.',
        7: 'Places key at sorted position.',
      },
    },
    javascript: {
      lines: [
        'for (let i = 1; i < arr.length; i++) {',
        '  let key = arr[i];',
        '  let j = i - 1;',
        '  while (j >= 0 && arr[j] > key) {',
        '    arr[j + 1] = arr[j];',
        '    j--;',
        '  }',
        '  arr[j + 1] = key;',
        '}',
      ],
      lineExplanations: {
        1: 'Walks each unsorted item.',
        2: 'Extracts value into key variable.',
        4: 'Shifts larger elements rightward.',
        8: 'Drops key into its final sorted position.',
      },
    },
  },
  binarySearch: {
    java: {
      lines: [
        'int left = 0, right = arr.length - 1;',
        'while (left <= right) {',
        '    int mid = left + (right - left) / 2;',
        '    if (arr[mid] == target) return mid;',
        '    if (arr[mid] < target) left = mid + 1;',
        '    else right = mid - 1;',
        '}',
        'return -1;',
      ],
      lineExplanations: {
        1: 'Initializes left and right search window pointers.',
        2: 'Loops while search window remains valid.',
        3: 'Calculates middle index without integer overflow.',
        4: 'Returns mid index if target matches arr[mid].',
        5: 'Discards left half if target is strictly larger.',
        6: 'Discards right half if target is strictly smaller.',
      },
    },
    cpp: {
      lines: [
        'int left = 0, right = arr.size() - 1;',
        'while (left <= right) {',
        '    int mid = left + (right - left) / 2;',
        '    if (arr[mid] == target) return mid;',
        '    if (arr[mid] < target) left = mid + 1;',
        '    else right = mid - 1;',
        '}',
        'return -1;',
      ],
      lineExplanations: {
        1: 'Defines window boundaries [0, n-1].',
        2: 'Halves search space on each pass.',
        3: 'Midpoint calculation avoids overflow.',
        4: 'Target found return branch.',
        5: 'Shifts left pointer to mid + 1.',
        6: 'Shifts right pointer to mid - 1.',
      },
    },
    python: {
      lines: [
        'left, right = 0, len(arr) - 1',
        'while left <= right:',
        '    mid = left + (right - left) // 2',
        '    if arr[mid] == target:',
        '        return mid',
        '    elif arr[mid] < target:',
        '        left = mid + 1',
        '    else:',
        '        right = mid - 1',
        'return -1',
      ],
      lineExplanations: {
        1: 'Sets window pointer tuple (0, len-1).',
        2: 'Runs while left pointer <= right pointer.',
        3: 'Computes integer division midpoint.',
        4: 'Returns index upon target match.',
        7: 'Eliminates left subarray.',
        9: 'Eliminates right subarray.',
      },
    },
    javascript: {
      lines: [
        'let left = 0, right = arr.length - 1;',
        'while (left <= right) {',
        '  let mid = Math.floor(left + (right - left) / 2);',
        '  if (arr[mid] === target) return mid;',
        '  if (arr[mid] < target) left = mid + 1;',
        '  else right = mid - 1;',
        '}',
        'return -1;',
      ],
      lineExplanations: {
        1: 'Initializes pointers on sorted collection.',
        2: 'Verifies search window boundaries.',
        3: 'Floors midpoint index calculation.',
        4: 'Returns found index.',
        5: 'Adjusts search region to right half.',
        6: 'Adjusts search region to left half.',
      },
    },
  },
};

const generateBubbleSortFrames = (initial: number[]): VisualizerFrame[] => {
  const frames: VisualizerFrame[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sortedIndices: number[] = [];

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [],
    activeLine: 1,
    explanation: 'Starting Bubble Sort on current array.',
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sorted: [...sortedIndices],
        activeLine: 3,
        explanation: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}).`,
      });

      if (arr[j] > arr[j + 1]) {
        const prevJ = arr[j];
        const prevJ1 = arr[j + 1];
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        frames.push({
          array: [...arr],
          comparing: [],
          swapped: [j, j + 1],
          sorted: [...sortedIndices],
          activeLine: 4,
          explanation: `Swapped: ${prevJ} was greater than ${prevJ1}.`,
          variableDiff: [
            { varName: `arr[${j}]`, prev: prevJ.toString(), next: arr[j].toString() },
            { varName: `arr[${j + 1}]`, prev: prevJ1.toString(), next: arr[j + 1].toString() },
          ],
        });
      }
    }
    sortedIndices.push(n - i - 1);
  }
  sortedIndices.push(0);

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    activeLine: 1,
    explanation: 'Sorting complete! All elements are in non-decreasing order.',
  });

  return frames;
};

const generateSelectionSortFrames = (initial: number[]): VisualizerFrame[] => {
  const frames: VisualizerFrame[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sortedIndices: number[] = [];

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [],
    activeLine: 1,
    explanation: 'Starting Selection Sort: Finding the minimum element for each position.',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push({
      array: [...arr],
      comparing: [i],
      swapped: [],
      sorted: [...sortedIndices],
      activeLine: 2,
      explanation: `Set candidate minimum minIdx = ${i} (value: ${arr[i]}).`,
    });

    for (let j = i + 1; j < n; j++) {
      frames.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapped: [],
        sorted: [...sortedIndices],
        activeLine: 3,
        explanation: `Comparing arr[${j}] (${arr[j]}) with current min arr[${minIdx}] (${arr[minIdx]}).`,
      });

      if (arr[j] < arr[minIdx]) {
        const prevMin = minIdx;
        minIdx = j;
        frames.push({
          array: [...arr],
          comparing: [minIdx],
          swapped: [],
          sorted: [...sortedIndices],
          activeLine: 4,
          explanation: `New minimum found at index ${j} (value: ${arr[j]}).`,
          variableDiff: [{ varName: 'minIdx', prev: prevMin.toString(), next: minIdx.toString() }],
        });
      }
    }

    if (minIdx !== i) {
      const prevI = arr[i];
      const prevMin = arr[minIdx];
      const temp = arr[minIdx];
      arr[minIdx] = arr[i];
      arr[i] = temp;

      frames.push({
        array: [...arr],
        comparing: [],
        swapped: [i, minIdx],
        sorted: [...sortedIndices],
        activeLine: 6,
        explanation: `Swapped minimum element ${prevMin} into position ${i}.`,
        variableDiff: [
          { varName: `arr[${i}]`, prev: prevI.toString(), next: arr[i].toString() },
          { varName: `arr[${minIdx}]`, prev: prevMin.toString(), next: arr[minIdx].toString() },
        ],
      });
    }

    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    activeLine: 1,
    explanation: 'Selection Sort completed successfully!',
  });

  return frames;
};

const generateInsertionSortFrames = (initial: number[]): VisualizerFrame[] => {
  const frames: VisualizerFrame[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sortedIndices: number[] = [0];

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [0],
    activeLine: 1,
    explanation: 'Starting Insertion Sort: First element is trivially sorted.',
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    frames.push({
      array: [...arr],
      comparing: [i],
      swapped: [],
      sorted: [...sortedIndices],
      activeLine: 2,
      explanation: `Selected key = arr[${i}] (${key}) to insert into sorted partition.`,
      variableDiff: [{ varName: 'key', prev: 'undefined', next: key.toString() }],
    });

    while (j >= 0 && arr[j] > key) {
      frames.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sorted: [...sortedIndices],
        activeLine: 4,
        explanation: `arr[${j}] (${arr[j]}) > key (${key}). Shifting ${arr[j]} rightward.`,
      });

      const prevNext = arr[j + 1];
      arr[j + 1] = arr[j];
      frames.push({
        array: [...arr],
        comparing: [],
        swapped: [j + 1],
        sorted: [...sortedIndices],
        activeLine: 5,
        explanation: `Shifted arr[${j}] to index ${j + 1}.`,
        variableDiff: [{ varName: `arr[${j + 1}]`, prev: prevNext.toString(), next: arr[j + 1].toString() }],
      });

      j = j - 1;
    }

    arr[j + 1] = key;
    sortedIndices.push(i);

    frames.push({
      array: [...arr],
      comparing: [],
      swapped: [j + 1],
      sorted: [...sortedIndices],
      activeLine: 8,
      explanation: `Placed key (${key}) into slot ${j + 1}.`,
    });
  }

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    activeLine: 1,
    explanation: 'Insertion Sort complete!',
  });

  return frames;
};

const generateBinarySearchFrames = (initial: number[], target: number): VisualizerFrame[] => {
  const frames: VisualizerFrame[] = [];
  const arr = [...initial].sort((a, b) => a - b);
  let left = 0;
  let right = arr.length - 1;
  let foundIndex = -1;

  frames.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [],
    activeLine: 1,
    explanation: `Starting Binary Search for target ${target} on sorted array.`,
  });

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    frames.push({
      array: [...arr],
      comparing: [mid],
      swapped: [],
      sorted: [left, right],
      activeLine: 3,
      explanation: `Calculated midpoint: index ${mid} (value: ${arr[mid]}). Search window [${left}, ${right}].`,
      variableDiff: [
        { varName: 'left', prev: left.toString(), next: left.toString() },
        { varName: 'right', prev: right.toString(), next: right.toString() },
        { varName: 'mid', prev: 'undefined', next: mid.toString() },
      ],
    });

    if (arr[mid] === target) {
      foundIndex = mid;
      frames.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: [mid],
        activeLine: 4,
        explanation: `Target ${target} found at index ${mid}!`,
      });
      break;
    } else if (arr[mid] < target) {
      const prevLeft = left;
      left = mid + 1;
      frames.push({
        array: [...arr],
        comparing: [mid],
        swapped: [],
        sorted: [],
        activeLine: 5,
        explanation: `arr[${mid}] (${arr[mid]}) < ${target}. Target is in right partition. Shifting left pointer.`,
        variableDiff: [{ varName: 'left', prev: prevLeft.toString(), next: left.toString() }],
      });
    } else {
      const prevRight = right;
      right = mid - 1;
      frames.push({
        array: [...arr],
        comparing: [mid],
        swapped: [],
        sorted: [],
        activeLine: 6,
        explanation: `arr[${mid}] (${arr[mid]}) > ${target}. Target is in left partition. Shifting right pointer.`,
        variableDiff: [{ varName: 'right', prev: prevRight.toString(), next: right.toString() }],
      });
    }
  }

  if (foundIndex === -1) {
    frames.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sorted: [],
      activeLine: 8,
      explanation: `Target ${target} does not exist in the array (returned -1).`,
    });
  }

  return frames;
};

export const Visualizer = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmKey>('bubble');
  const [selectedLang, setSelectedLang] = useState<Language>('java');
  const [initialArray, setInitialArray] = useState<number[]>([45, 12, 85, 32, 89, 21, 64]);
  const [customInput, setCustomInput] = useState<string>('45, 12, 85, 32, 89, 21, 64');
  const [frames, setFrames] = useState<VisualizerFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [hoveredLineNum, setHoveredLineNum] = useState<number | null>(null);

  // Audio Sonification Toggle State
  const [soundOn, setSoundOn] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);

  const toggleSound = () => {
    soundEngine.enabled = !soundOn;
    setSoundOn(!soundOn);
  };

  // Generate Frames on Algorithm or Array Change
  useEffect(() => {
    let generated: VisualizerFrame[] = [];
    if (selectedAlgo === 'bubble') {
      generated = generateBubbleSortFrames(initialArray);
    } else if (selectedAlgo === 'selection') {
      generated = generateSelectionSortFrames(initialArray);
    } else if (selectedAlgo === 'insertion') {
      generated = generateInsertionSortFrames(initialArray);
    } else if (selectedAlgo === 'binarySearch') {
      const target = initialArray[Math.floor(initialArray.length / 2)] || 32;
      generated = generateBinarySearchFrames(initialArray, target);
    }

    setFrames(generated);
    setCurrentFrameIdx(0);
    setIsPlaying(false);
  }, [initialArray, selectedAlgo]);

  // Real-time Sound Trigger on Frame Change
  useEffect(() => {
    if (!soundOn || !frames || frames.length === 0 || currentFrameIdx < 0) return;

    const frame = frames[currentFrameIdx];
    if (!frame) return;

    const currentArray = frame.array || [];
    if (currentArray.length === 0) return;

    const minVal = Math.min(...currentArray);
    const maxVal = Math.max(...currentArray);

    if (frame.comparing && frame.comparing.length > 0) {
      const val = currentArray[frame.comparing[0]];
      if (val !== undefined) soundEngine.playTone(val, minVal, maxVal, 'sine');
    } else if (frame.swapped && frame.swapped.length > 0) {
      const val = currentArray[frame.swapped[0]];
      if (val !== undefined) soundEngine.playTone(val, minVal, maxVal, 'triangle');
    } else if (frame.sorted && frame.sorted.length > 0) {
      const val = currentArray[frame.sorted[0]] || maxVal;
      soundEngine.playTone(val, minVal, maxVal, 'square');
    }
  }, [currentFrameIdx, soundOn, frames]);

  // Handle Playback Interval using Speed Multiplier
  useEffect(() => {
    if (isPlaying) {
      const delayMs = Math.round(500 / speedMultiplier);
      timerRef.current = window.setInterval(() => {
        setCurrentFrameIdx((prev) => {
          if (prev < frames.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, delayMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, frames, speedMultiplier]);

  const currentFrame = frames[currentFrameIdx] || {
    array: initialArray,
    comparing: [],
    swapped: [],
    sorted: [],
    activeLine: 1,
    explanation: 'Ready to run.',
  };

  const activeCodeData = ALGORITHM_CODES[selectedAlgo][selectedLang];

  const handleApplyCustomArray = () => {
    const parsed = customInput
      .split(',')
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    if (parsed.length >= 3) {
      setInitialArray(parsed.slice(0, 10));
    }
  };

  const handleRandomize = () => {
    const randoms = Array.from({ length: 7 }, () => Math.floor(Math.random() * 85) + 10);
    setInitialArray(randoms);
    setCustomInput(randoms.join(', '));
  };

  return (
    <div className="space-y-8">
      {/* 1. Standalone Top Main Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3EEE7] dark:bg-emerald-950/60 text-[#1E4D40] dark:text-emerald-300 text-xs font-bold shadow-xs">
          <Sparkles size={14} /> Interactive Algorithm Studio
        </div>
        <h1 className="font-handwriting text-4xl lg:text-5xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          DSA Visualizer
        </h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl">
          Watch data structures and algorithms execute step-by-step in your preferred programming language with real-time memory mutation traces.
        </p>
      </div>

      {/* 2. Top Navigation & Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-[#ECEAE0] dark:border-slate-800 p-4 rounded-3xl shadow-xs">
        {/* Algorithm Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">Algorithm:</span>
          <div className="flex bg-[#FAF8F3] dark:bg-slate-800 p-1 rounded-2xl border border-[#ECEAE0] dark:border-slate-700">
            {(['bubble', 'selection', 'insertion', 'binarySearch'] as AlgorithmKey[]).map((algo) => (
              <button
                key={algo}
                onClick={() => setSelectedAlgo(algo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  selectedAlgo === algo
                    ? 'bg-[#1E4D40] dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-200'
                }`}
              >
                {algo === 'binarySearch' ? 'Binary Search' : `${algo} Sort`}
              </button>
            ))}
          </div>
        </div>

        {/* Language Chooser */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">Language:</span>
          <div className="flex bg-[#FAF8F3] dark:bg-slate-800 p-1 rounded-2xl border border-[#ECEAE0] dark:border-slate-700">
            {(['java', 'cpp', 'python', 'javascript'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                  selectedLang === lang
                    ? 'bg-[#1E4D40] dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-200'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Animation Canvas & Live Synchronized Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Visual Canvas & Playback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-[#ECEAE0] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col h-[340px] justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#1E4D40] dark:text-emerald-400" />
                <span className="text-xs font-bold text-[#1E293B] dark:text-slate-200">
                  {currentFrame.explanation}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8C9AA8]">
                Step {currentFrameIdx + 1} / {frames.length}
              </span>
            </div>

            {/* Array Bars */}
            <div className="flex items-end justify-center gap-3.5 h-48 px-4 pb-2 border-b border-[#ECEAE2] dark:border-slate-800">
              {currentFrame.array.map((val, idx) => {
                const isComparing = currentFrame.comparing.includes(idx);
                const isSwapped = currentFrame.swapped.includes(idx);
                const isSorted = currentFrame.sorted.includes(idx);

                let barBg = 'bg-[#1E4D40] dark:bg-emerald-600';
                if (isComparing) barBg = 'bg-amber-400 animate-pulse';
                if (isSwapped) barBg = 'bg-rose-500';
                if (isSorted) barBg = 'bg-[#2C8562] dark:bg-emerald-500';

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[50px]">
                    <span className="text-[11px] font-bold font-mono text-[#2D3748] dark:text-slate-200">
                      {val}
                    </span>
                    <div
                      style={{ height: `${val * 1.8}px` }}
                      className={`w-full rounded-xl transition-all duration-300 ${barBg} shadow-xs`}
                    />
                    <span className="text-[10px] text-[#8C9AA8] font-mono">[{idx}]</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-[#64748B] dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E4D40] dark:bg-emerald-600" /> Default
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Comparing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Swapping
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C8562] dark:bg-emerald-500" /> Settled / Target
              </span>
            </div>
          </div>

          {/* Controls & Sliding Speed Bar Panel */}
          <div className="bg-white dark:bg-slate-900 border border-[#ECEAE0] dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentFrameIdx >= frames.length - 1) setCurrentFrameIdx(0);
                  setIsPlaying(!isPlaying);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E4D40] hover:bg-[#163930] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                disabled={currentFrameIdx === 0 || isPlaying}
                onClick={() => setCurrentFrameIdx((prev) => Math.max(0, prev - 1))}
                className="p-2 bg-[#FAF8F3] dark:bg-slate-800 hover:bg-[#ECEAE2] text-[#2D3748] dark:text-slate-200 border border-[#ECEAE0] dark:border-slate-700 rounded-xl disabled:opacity-40 transition cursor-pointer"
                title="Step Backward"
              >
                <SkipBack size={16} />
              </button>

              <button
                disabled={currentFrameIdx >= frames.length - 1 || isPlaying}
                onClick={() => setCurrentFrameIdx((prev) => Math.min(frames.length - 1, prev + 1))}
                className="p-2 bg-[#FAF8F3] dark:bg-slate-800 hover:bg-[#ECEAE2] text-[#2D3748] dark:text-slate-200 border border-[#ECEAE0] dark:border-slate-700 rounded-xl disabled:opacity-40 transition cursor-pointer"
                title="Step Forward"
              >
                <SkipForward size={16} />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIdx(0);
                }}
                className="p-2 text-[#64748B] hover:text-[#1E293B] dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
                title="Reset Animation"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Speed Range Slider (0.25x to 2.0x) + Audio Toggle Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-[#FAF8F3] dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-[#ECEAE0] dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-slate-400">
                  <Gauge size={14} className="text-[#1E4D40] dark:text-emerald-400" />
                  <span>Speed:</span>
                  <span className="font-mono text-[#1E4D40] dark:text-emerald-300 font-extrabold w-10 text-right">
                    {speedMultiplier.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.0"
                  step="0.25"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-24 accent-[#1E4D40] dark:accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Web Audio Sonification Toggle */}
              <button
                onClick={toggleSound}
                className="p-2.5 rounded-2xl bg-[#FAF8F3] dark:bg-slate-800 hover:bg-[#ECEAE2] dark:hover:bg-slate-700 border border-[#ECEAE0] dark:border-slate-700 text-[#2D3748] dark:text-slate-200 transition-colors cursor-pointer"
                title={soundOn ? 'Mute Sonification' : 'Enable Sonification'}
              >
                {soundOn ? (
                  <Volume2 size={16} className="text-[#1E4D40] dark:text-emerald-400" />
                ) : (
                  <VolumeX size={16} className="text-gray-400" />
                )}
              </button>
            </div>

            {/* Array Customization */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. 10, 4, 8"
                className="bg-[#FAF8F3] dark:bg-slate-800 border border-[#ECEAE0] dark:border-slate-700 text-xs text-[#2D3748] dark:text-slate-200 rounded-xl px-2.5 py-1.5 w-28 focus:outline-none"
              />
              <button
                onClick={handleApplyCustomArray}
                className="px-2.5 py-1.5 bg-[#FAF8F3] dark:bg-slate-800 hover:bg-[#EFECE1] border border-[#ECEAE0] dark:border-slate-700 rounded-xl text-xs font-bold text-[#1E293B] dark:text-slate-200 cursor-pointer"
              >
                Set
              </button>
              <button
                onClick={handleRandomize}
                className="px-2.5 py-1.5 bg-[#FAF8F3] dark:bg-slate-800 hover:bg-[#EFECE1] border border-[#ECEAE0] dark:border-slate-700 rounded-xl text-xs font-bold text-[#1E293B] dark:text-slate-200 cursor-pointer"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Synchronized Code & Hover Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#1E1E2E] text-slate-200 rounded-3xl p-4 border border-[#ECEAE0] dark:border-slate-800 shadow-xs flex flex-col h-[280px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-xs font-mono">
              <span>algorithm.{selectedLang === 'cpp' ? 'cpp' : selectedLang === 'python' ? 'py' : selectedLang === 'java' ? 'java' : 'js'}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">{selectedLang} synchronized</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs select-none">
              {activeCodeData.lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isCurrentlyExecuting = currentFrame.activeLine === lineNum;
                const isHovered = hoveredLineNum === lineNum;

                return (
                  <div
                    key={lineNum}
                    onMouseEnter={() => setHoveredLineNum(lineNum)}
                    onMouseLeave={() => setHoveredLineNum(null)}
                    className={`flex items-center gap-3 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                      isCurrentlyExecuting
                        ? 'bg-emerald-500/25 border-l-2 border-emerald-400 text-emerald-200 font-bold'
                        : isHovered
                        ? 'bg-slate-800'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 w-4 text-right text-[11px]">{lineNum}</span>
                    <code className="flex-1 whitespace-pre">{lineText}</code>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#ECEAE0] dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col h-[180px] justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-1.5">
                <Zap size={14} className="text-[#1E4D40] dark:text-emerald-400" />
                Line Impact & Mutated Variables
              </span>
              <span className="text-[10px] bg-[#E3EEE7] dark:bg-emerald-950/60 text-[#1E4D40] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Hover to Inspect
              </span>
            </div>

            {hoveredLineNum && activeCodeData.lineExplanations[hoveredLineNum] ? (
              <div className="bg-[#FAF8F3] dark:bg-slate-800/60 border border-[#ECEAE0] dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-[#1E4D40] dark:text-emerald-400">
                  Line {hoveredLineNum} Role:
                </span>
                <p className="text-xs text-[#1E293B] dark:text-slate-200 font-medium">
                  {activeCodeData.lineExplanations[hoveredLineNum]}
                </p>
              </div>
            ) : currentFrame.variableDiff && currentFrame.variableDiff.length > 0 ? (
              <div className="bg-[#FAF8F3] dark:bg-slate-800/60 border border-[#ECEAE0] dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Live Execution Variable Shift:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentFrame.variableDiff.map((diff, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#ECEAE0] dark:border-slate-700"
                    >
                      <span className="font-bold text-[#1E4D40] dark:text-emerald-400">{diff.varName}</span>
                      <span className="text-[#8C9AA8]">{diff.prev}</span>
                      <ArrowRight size={12} className="text-[#8C9AA8]" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-300">{diff.next}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-[#8C9AA8] dark:text-slate-500 py-3 text-xs">
                <HelpCircle size={18} className="mx-auto mb-1 opacity-60" />
                Hover on any code line above or press Play to inspect runtime changes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};