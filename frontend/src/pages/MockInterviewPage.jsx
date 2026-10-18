import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { resumeApi, JOB_TITLES } from '../api/resumeApi';

export default function MockInterviewPage({ resumeText = '' }) {
  const [role, setRole] = useState('Full Stack Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Interview state
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // question_index -> text
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState(null);

  // Voice Mode States
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => (prev ? prev + ' ' : '') + transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }
  }, []);

  // Timer logic for live speaking
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Read question aloud using SpeechSynthesis
  const speakQuestion = (text) => {
    if (voiceMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Browser speech recognition not available. Please type your response.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Start interview session
  const handleStartInterview = async () => {
    setLoading(true);
    setStatusMessage('Crafting customized interview questions from your profile...');
    try {
      const res = await resumeApi.startInterview(role, difficulty, resumeText);
      setInterviewId(res.interview_id);
      setQuestions(res.questions);
      setCurrentQuestionIndex(0);
      setInterviewStarted(true);
      setAnswers({});
      setCurrentAnswer('');
      setIsCompleted(false);
      setReport(null);
      setTimerSeconds(0);

      // Read first question aloud
      if (res.questions && res.questions.length > 0) {
        speakQuestion(res.questions[0].question);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start interview.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Submit current answer and advance
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before advancing.');
      return;
    }

    if (isRecording) {
      toggleRecording();
    }

    const currentQ = questions[currentQuestionIndex];

    try {
      await resumeApi.submitInterviewAnswer(
        interviewId,
        currentQuestionIndex,
        currentQ.question,
        currentQ.category || 'Technical',
        currentAnswer,
        timerSeconds
      );

      const updatedAnswers = { ...answers, [currentQuestionIndex]: currentAnswer };
      setAnswers(updatedAnswers);
      setCurrentAnswer('');
      setTimerSeconds(0);

      if (currentQuestionIndex + 1 < questions.length) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        speakQuestion(questions[nextIndex].question);
      } else {
        // All questions done! Compile final report
        handleFinishInterview();
      }
    } catch (err) {
      alert('Error saving response. Please retry.');
    }
  };

  // Conclude interview and compile executive report
  const handleFinishInterview = async () => {
    if (isRecording) toggleRecording();
    setLoading(true);
    setStatusMessage('Compiling comprehensive Gemini evaluation report...');

    try {
      const res = await resumeApi.finishInterview(interviewId);
      setReport(res.report);
      setIsCompleted(true);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert('Error generating interview report.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setInterviewStarted(false);
    setIsCompleted(false);
    setReport(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer('');
  };

  // 1. Report View
  if (isCompleted && report) {
    const overallScore = Math.round(report.overall_score || 75);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-emerald-500">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Evaluation Complete
              </span>
              <span className="text-xs text-[var(--text-muted)]">{role} • {difficulty}</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              AI Mock Interview Performance Report
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
              {report.summary}
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="text-4xl font-black text-emerald-500">{overallScore}%</div>
            <div className="text-xs font-semibold text-[var(--text-secondary)]">{report.readiness_level}</div>
          </div>
        </div>

        {/* Per-Question Detailed Feedback */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" /> Question-by-Question Evaluation & Exemplars
          </h2>

          {report.per_question_reviews?.map((rev, idx) => (
            <div key={idx} className="glass-panel p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  Q{idx + 1}: {rev.question}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {Math.round(rev.score)}%
                </span>
              </div>

              {/* Feedback Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="font-bold text-[var(--text-primary)] block mb-1">Structure & Delivery:</span>
                  <p className="text-[var(--text-secondary)]">{rev.clarity_and_structure_feedback}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                  <span className="font-bold text-[var(--text-primary)] block mb-1">Content Depth:</span>
                  <p className="text-[var(--text-secondary)]">{rev.content_evaluation}</p>
                </div>
              </div>

              {rev.mistakes_and_filler_words && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs">
                  <span className="font-bold text-red-400 block mb-1">Pointers & Polish Needed:</span>
                  <p className="text-[var(--text-secondary)]">{rev.mistakes_and_filler_words}</p>
                </div>
              )}

              {/* Exemplar Strong Answer */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> What a 95%+ Strong Answer Looks Like:
                </span>
                <p className="text-[var(--text-primary)] font-medium leading-relaxed italic">
                  "{rev.exemplar_strong_answer}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Steps */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" /> Actionable Next Steps
          </h3>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {report.actionable_next_steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl font-semibold text-xs text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] hover:border-emerald-500/40 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Another Mock Interview</span>
        </button>

      </div>
    );
  }

  // 2. Live Interview In-Progress View
  if (interviewStarted && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const progressPercent = ((currentQuestionIndex + 1) / totalQ) * 100;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Top Progress & Mute Bar */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">Question {currentQuestionIndex + 1} of {totalQ}</span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[10px] uppercase font-bold text-emerald-500">
              {currentQ.category || 'Interview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted && window.speechSynthesis) window.speechSynthesis.cancel();
              }}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
              title={voiceMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
            <button
              onClick={handleFinishInterview}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              End Interview Early
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="glass-panel p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> AI Interviewer
            </span>
            <button
              onClick={() => speakQuestion(currentQ.question)}
              className="text-[11px] text-[var(--text-muted)] hover:text-emerald-500 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" /> Replay Voice
            </button>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] leading-snug">
            {currentQ.question}
          </h2>
          {currentQ.context && (
            <p className="text-xs text-[var(--text-secondary)] italic">
              Context: {currentQ.context}
            </p>
          )}
        </div>

        {/* Answer Input Area */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Your Answer
            </label>
            
            {/* Live Speaking Indicator */}
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>Recording ({timerSeconds}s)</span>
                </div>
              )}
            </div>
          </div>

          <textarea
            rows={5}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your response, or click the microphone button below to speak your answer naturally..."
            className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Voice toggle button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white mic-recording-pulse' 
                  : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-500" />}
              <span>{isRecording ? 'Stop Speaking' : 'Speak Answer'}</span>
            </button>

            {/* Next / Submit Button */}
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !currentAnswer.trim()}
              className="py-2.5 px-6 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <span>{currentQuestionIndex + 1 === totalQ ? 'Submit & Finalize' : 'Next Question'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

      </div>
    );
  }

  // 3. Setup / Configuration View
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini 3.8 & Groq
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          AI Mock Interview Simulator
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Practice one-on-one tailored interview questions generated directly from your target role and resume experience.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Target Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {JOB_TITLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Interview Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Easy', 'Medium', 'Hard'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  difficulty === lvl
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-2 text-xs text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--text-primary)] block">How the Interview Works:</span>
          <p>• Questions are generated covering Technical, Project, and Behavioral competencies.</p>
          <p>• You can speak answers using your microphone or type them directly.</p>
          <p>• No mid-interview interruptions. A complete executive evaluation report with scores & model answers is generated upon completion.</p>
        </div>

        <button
          onClick={handleStartInterview}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage || 'Preparing questions...'}</span>
            </div>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span>Begin Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
