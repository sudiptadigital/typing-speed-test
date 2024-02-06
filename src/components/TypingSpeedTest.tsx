import { useEffect, useRef, useState } from 'react';

const duration = 60;
const countDownTime = 3;

function App() {
  const [text, setText] = useState<string>("");
  const [samplePara, setSamplePara] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const [isTimeRunning, setIsTimeRunning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(countDownTime);
  const [WPM, setWPM] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [word, setWord] = useState<{correctWord: number, wrongWord: number}>({correctWord:0, wrongWord:0});
  const [highScore, setHighScore] = useState<number>(parseInt(localStorage.getItem('highScore') || "0", 10));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    fetchRandomPara();
  }, []);

  useEffect(() => {
    if (isTimeRunning && countdown > 0) {
        intervalRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timeRemaining > 0 && isTimeRunning) {
        intervalRef.current = setTimeout(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0) {
      endGame();
    }
    return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          
        }
      };
  }, [countdown, timeRemaining, isTimeRunning]);

  async function fetchRandomPara() {
    try {        
      const response = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1&format=text");
      const data = await response.text();
      setSamplePara(data);
    } catch (error) {
      console.error('Error fetching random paragraph:', error);
    }
  }

  function startGame() {
    fetchRandomPara();
    setIsTimeRunning(true);
    setCountdown(countDownTime);
    setText("");
    setTimeRemaining(duration);
    setAccuracy(0);
    setWPM(0);
    setAccuracy(0);
    setWord({correctWord:0, wrongWord:0});
  }

  function endGame() {
    let wordTyped = 0
    let wordTypedPerMin = 0;

    setIsTimeRunning(false);
  
    if(text.trim()){
         wordTyped = text.trim().split(" ").length;
    }

    if(duration>timeRemaining){
         wordTypedPerMin = +((wordTyped/(duration-timeRemaining))*60).toFixed(2)
    }
    setWPM(wordTypedPerMin);

    const accuracyPercentage = ((wordTyped / samplePara.split(" ").length) * 100).toFixed(2);
    setAccuracy(parseFloat(accuracyPercentage));

    if (wordTyped > highScore) {
      setHighScore(wordTyped);
      localStorage.setItem('highScore', wordTyped.toString());
    }

    setWord(handleCorrectWord());

  }

  function handleText(text: string){
        setText(text);
        
  }

  function renderFeedbackText() {
    return Array.from(samplePara).map((char, index) => {        
      if (index < text.length) {        
        if (char === text[index]) {
          return <span className='text-green-500' key={index}>{char}</span>;
        } else {
          return <span className='text-red-500' key={index}>{char}</span>;
        }
      }
      return <span key={index}>{char}</span>;
    });
  }

  function handleCorrectWord(){
    let correctWord=0;
    let wrongWord=0;
    let j=0;
    const sampleParaArray = samplePara.split(" ");
    const textArray = text.split(" ");

    textArray.forEach((word) => {
        if(word){
            if(word === sampleParaArray[j]){
                correctWord++;
            }else{
                wrongWord++;
            }
            j++;
        }
    })
    return {correctWord, wrongWord};
    
}

return (
    <>
      <div className='h-screen bg-gray-100 flex flex-col items-center justify-center'>
        <div className='p-8 bg-white shadow-lg rounded-md space-y-4 w-1/3'>
          <h2 className='text-2xl font-bold text-center mb-4'>TYPING SPEED TEST</h2>
          <div className='whitespace-pre-wrap overflow-x-hidden text-gray-700'>
            {renderFeedbackText()}
          </div>
          <textarea
            value={text}
            onChange={(e) => handleText(e.target.value)}
            disabled={!isTimeRunning || countdown > 0}
            className="w-full p-4 border rounded-md transition duration-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder={
              countdown > 0 ? `Starting in ${countdown}....` : "Start typing here ...."
            }
          ></textarea>
          <div className='flex justify-between items-center mt-4'>
            <div></div>
            <button
              onClick={isTimeRunning ? endGame : startGame}
              className={`px-6 py-2 bg-blue-500 text-white rounded-md transition duration-300 ${isTimeRunning ? "bg-red-500" : ""}`}
            >
              {isTimeRunning ? "Stop" : "Start"}
            </button>
          </div>
          <div className='flex justify-between mt-4'>
            <p> Time remaining: {timeRemaining}s</p>
            <p> High Score: {highScore} WPM</p>
          </div>
          <div className=' flex justify-between mt-4'>
            <p>WPM: {WPM}</p>
            <p>Accuracy: {accuracy}%</p>
          </div>
          <div className=' flex justify-between mt-4'>
            <p>Correct Word: {word.correctWord}</p>
            <p>Wrong Word: {word.wrongWord}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
