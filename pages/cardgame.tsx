import { useTheme } from 'next-themes';
import { useState, useRef, useEffect } from 'react';
import WheelPicker, { PickerData } from 'react-simple-wheel-picker';
import Header from '../components/header';

const ops = ['+', '-', '/', '*'];
const cards: PickerData[] = [
  { id: '1', value: '1' },
  { id: '2', value: '2' },
  { id: '3', value: '3' },
  { id: '4', value: '4' },
  { id: '5', value: '5' },
  { id: '6', value: '6' },
  { id: '7', value: '7' },
  { id: '8', value: '8' },
  { id: '9', value: '9' },
  { id: '10', value: '10' },
  { id: '11', value: '11' },
  { id: '12', value: '12' },
  { id: '13', value: '13' },
];

function permutator(inputArr: number[]): number[][] {
  let result: number[][] = [];
  const permute = (arr: number[], m: number[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };
  permute(inputArr);
  return result;
}

function opsCombo(length: number): string[][] {
  let result: string[][] = [];
  const permute = (length: number, m: string[] = []) => {
    if (length === 0) {
      result.push(m);
      return;
    }
    for (let i = 0; i < ops.length; i++) {
      let x: string[] = [...m, ops[i]];
      permute(length - 1, x);
    }
  };
  permute(length);
  return result;
}

function solution(nums: number[]): string[] {
  const numPerms = permutator(nums);
  const opsPerms = opsCombo(nums.length - 1);
  const solutionSet = new Set<string>();

  for (let i = 0; i < numPerms.length; i++) {
    for (let j = 0; j < opsPerms.length; j++) {
      let res = numPerms[i][0];
      let resString = String(numPerms[i][0]);
      for (let k = 1; k < numPerms[i].length; k++) {
        switch (opsPerms[j][k - 1]) {
          case '+':
            res += numPerms[i][k];
            resString += `+${numPerms[i][k]}`;
            break;
          case '-':
            res -= numPerms[i][k];
            resString += `-${numPerms[i][k]}`;
            break;
          case '*':
            res *= numPerms[i][k];
            resString += `*${numPerms[i][k]}`;
            break;
          case '/':
            res /= numPerms[i][k];
            resString += `/${numPerms[i][k]}`;
            break;
        }
      }
      if (res === 36) {
        solutionSet.add(resString);
      }
    }
  }
  return Array.from(solutionSet);
};

export default function CardGame() {
  const [nums, setNums] = useState<number[]>([1, 1, 1, 1, 1]);
  const [results, setResults] = useState<string[]>([]);
  const { systemTheme, theme } = useTheme();
  const [clientTheme, setClientTheme] = useState<string>('light');
  useEffect(() => {
    setClientTheme((theme === 'system' ? systemTheme : theme) ?? 'light');
  }, [theme, systemTheme]);

  // debounce
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChange = (data: PickerData, index: number) => {
    if (t.current) {
      clearTimeout(t.current);
    }
    t.current = setTimeout(() => {
      setNums((value: number[]) => {
        value[index] = parseInt(data.id);
        setResults(solution(value));
        return value;
      });
    }, 100);
  };
  return <>
    <Header />
    <div className='max-w-7xl mx-auto'>
      <div className='w-full flex flex-row'>
        {
          nums.map((_, index: number) => {
            return <WheelPicker
              key={index}
              data={cards}
              onChange={(data: PickerData) => handleChange(data, index)}
              height={150}
              width={100}
              itemHeight={30}
              selectedID={cards[0].id}
              color={clientTheme === 'dark' ? '#bbb' : '#333'}
              activeColor={clientTheme === 'dark' ? '#fff' : '#000'}
              backgroundColor={clientTheme === 'dark' ? '#333' : '#fff'}
            />;
          })
        }
      </div>
      {
        results.map((value: string, index: number) => {
          return <p key={index} className='font-mono'>
            {value}
          </p>;
        })
      }
    </div>
  </>;
};