import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  RotateCcw, 
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { resumeApi, JOB_TITLES } from '../api/resumeApi';

export default function MockInterviewPage({ resumeText = '' }) {
  const [role, setRole] = useState('Full Stack Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Interview flow state
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState(null);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
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
          if (event.error === 'not-allowed') {
            setMicPermissionDenied(true);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setHasSpeechRecognition(true);
      } catch (e) {
        setHasSpeechRecognition(false);
      }
    } else {
      setHasSpeechRecognition(false);
    }

    if (navigator.mediaDevices && window.MediaRecorder) {
      setMediaRecorderSupported(true);
    }
  }, []);

  // Timer while recording
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

  // Read question text using speechSynthesis
  const speakQuestion = (text) => {
    if (voiceMuted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Start / Stop Microphone Recording (Web Speech or MediaRecorder fallback to Gemini)
  const toggleRecording = async () => {
    setMicPermissionDenied(false);

    if (isRecording) {
      // Stopping
      if (recognitionRef.current && hasSpeechRecognition) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Starting
    if (hasSpeechRecognition && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Web speech start error, falling back to MediaRecorder:', err);
        startMediaRecorderFallback();
      }
    } else if (mediaRecorderSupported) {
      startMediaRecorderFallback();
    } else {
      alert('Microphone access is not supported in this browser. Please type your response.');
    }
  };

  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        
        // Transcribe audio using Gemini audio endpoint
        setTranscribingAudio(true);
        try {
          const res = await resumeApi.transcribeAudio(audioBlob);
          if (res.data?.success && res.data?.text) {
            setCurrentAnswer((prev) => (prev ? prev + ' ' : '') + res.data.text);
          } else {
            console.warn('Transcription message:', res.data?.detail);
          }
        } catch (te) {
          console.warn('Gemini transcription request failed:', te);
        } finally {
          setTranscribingAudio(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setMicPermissionDenied(true);
      setIsRecording(false);
    }
  };

  // Launch interview
  const handleStartInterview = async () => {
    setLoading(true);
    setStatusMessage('Formulating custom interview questions for your profile...');
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

  // Record Answer & Progress
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before advancing.');
      return;
    }

    if (isRecording) {
      await toggleRecording();
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
        handleFinishInterview();
      }
    } catch (err) {
      alert('Error saving answer. Please retry.');
    }
  };

  // Conclude Session
  const handleFinishInterview = async () => {
    if (isRecording) await toggleRecording();
    setLoading(true);
    setStatusMessage('Generating Gemini comprehensive evaluation report...');

    try {
      const res = await resumeApi.finishInterview(interviewId);
      setReport(res.report);
      setIsCompleted(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
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

  // 1. Post-Interview Evaluation Report
  if (isCompleted && report) {
    const overallScore = Math.round(report.overall_score || 75);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Banner with Lavender Accent */}
        <div className="editorial-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-l-2 border-l-[var(--accent-interview)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-label text-[10px] text-[var(--accent-interview)]">
                SESSION COMPLETED
              </span>
              <span className="text-xs text-[var(--text-muted)]">• {role} · {difficulty}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-normal text-[var(--text-primary)]">
              Interview Performance <span className="font-editorial-italic text-2xl sm:text-3xl font-medium">Evaluation</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
              {report.summary}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-4xl font-mono-label font-bold text-[var(--accent-interview)]">{overallScore}%</div>
            <div className="font-mono-label text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{report.readiness_level}</div>
          </div>
        </div>

        {/* Per-Question Reviews */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--accent-interview)]" />
              Question Evaluations & Exemplar Answers
            </h2>
            <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
              DETAILED BREAKDOWN
            </span>
          </div>

          {report.per_question_reviews?.map((rev, idx) => (
            <div key={idx} className="editorial-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                  Q{idx + 1}: {rev.question}
                </span>
                <span className="font-mono-label text-[11px] font-bold px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--accent-interview)]">
                  {Math.round(rev.score)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="editorial-card-elevated p-3">
                  <span className="font-mono-label text-[10px] text-[var(--text-muted)] block mb-1">STRUCTURE & DELIVERY</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{rev.clarity_and_structure_feedback}</p>
                </div>
                <div className="editorial-card-elevated p-3">
                  <span className="font-mono-label text-[10px] text-[var(--text-muted)] block mb-1">CONTENT DEPTH</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{rev.content_evaluation}</p>
                </div>
              </div>

              {rev.mistakes_and_filler_words && (
                <div className="editorial-card-elevated p-3 border-l-2 border-l-[var(--accent-warning)] text-xs">
                  <span className="font-mono-label text-[10px] text-[var(--accent-warning)] block mb-0.5">POINTERS & CORRECTIONS</span>
                  <p className="text-[var(--text-secondary)]">{rev.mistakes_and_filler_words}</p>
                </div>
              )}

              {/* Exemplar Model Answer */}
              <div className="editorial-card-elevated p-4 border-l-2 border-l-[var(--accent-interview)] space-y-1">
                <span className="font-mono-label text-[10px] text-[var(--accent-interview)] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 95%+ EXEMPLAR MODEL ANSWER
                </span>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
                  "{rev.exemplar_strong_answer}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actionable Next Steps */}
        <div className="editorial-card p-6 space-y-3">
          <h3 className="font-mono-label text-[11px] text-[var(--text-primary)] font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--accent-interview)]" />
            ACTIONABLE REVISION STEPS
          </h3>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {report.actionable_next_steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-interview)] shrink-0 mt-1.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-md font-semibold text-xs border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center gap-2 min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-interview)]" />
          <span>Practice Another Mock Interview</span>
        </button>

      </div>
    );
  }

  // 2. Live Interview Interface (Optimized for Mobile & Desktop)
  if (interviewStarted && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const progressPercent = ((currentQuestionIndex + 1) / totalQ) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-5 pb-24 md:pb-8">
        
        {/* Top Progress & Controls */}
        <div className="flex items-center justify-between text-xs font-mono-label">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)] font-bold">Q{currentQuestionIndex + 1}/{totalQ}</span>
            <span className="px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[10px] text-[var(--accent-interview)]">
              {currentQ.category || 'TECHNICAL'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted && window.speechSynthesis) window.speechSynthesis.cancel();
              }}
              className="p-2 rounded-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[36px]"
              title={voiceMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {voiceMuted ? <VolumeX className="w-3.5 h-3.5 text-[var(--accent-warning)]" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--accent-interview)]" />}
            </button>
            <button
              onClick={handleFinishInterview}
              className="text-[11px] text-[var(--accent-warning)] hover:underline font-mono-label min-h-[36px] px-2"
            >
              CONCLUDE EARLY
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <div 
            className="h-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent-interview)' }}
          />
        </div>

        {/* Question Card */}
        <div className="editorial-card p-6 space-y-3 border-l-2 border-l-[var(--accent-interview)]">
          <div className="flex items-center justify-between font-mono-label text-[10px] text-[var(--text-muted)]">
            <span className="text-[var(--accent-interview)] font-bold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> INTERVIEWER
            </span>
            <button
              onClick={() => speakQuestion(currentQ.question)}
              className="hover:text-[var(--text-primary)] flex items-center gap-1 min-h-[32px]"
            >
              <Volume2 className="w-3 h-3" /> REPLAY VOICE
            </button>
          </div>
          <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)] leading-snug">
            {currentQ.question}
          </h2>
          {currentQ.context && (
            <p className="text-xs text-[var(--text-secondary)] italic">
              Context: {currentQ.context}
            </p>
          )}
        </div>

        {/* Microphone Permission Warning if applicable */}
        {micPermissionDenied && (
          <div className="p-3 rounded-md text-xs border border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Microphone permission denied. Please allow microphone access in your browser or type your answer directly.</span>
          </div>
        )}

        {/* Answer Input Area */}
        <div className="editorial-card p-5 space-y-4">
          <div className="flex items-center justify-between font-mono-label text-[10px] text-[var(--text-muted)]">
            <span>YOUR RESPONSE</span>
            {isRecording && (
              <span className="text-[var(--accent-warning)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-warning)] animate-ping" />
                RECORDING ({timerSeconds}S)
              </span>
            )}
            {transcribingAudio && (
              <span className="text-[var(--accent-interview)] font-bold">
                TRANSCRIBING AUDIO VIA GEMINI...
              </span>
            )}
          </div>

          <textarea
            rows={5}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your response here or click the microphone button below to speak..."
            className="w-full p-3.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-interview)] resize-none"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold min-h-[44px] transition-colors ${
                isRecording 
                  ? 'bg-[var(--accent-warning)] text-white' 
                  : 'border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)]'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[var(--accent-interview)]" />}
              <span>{isRecording ? 'Stop Recording' : 'Speak Answer'}</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !currentAnswer.trim()}
              className="px-5 py-2.5 rounded-md font-semibold text-xs text-white bg-[var(--accent-interview)] hover:opacity-95 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              <span>{currentQuestionIndex + 1 === totalQ ? 'Submit & Finalize' : 'Next Question'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-3.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-center text-xs font-mono-label text-[var(--accent-interview)]">
            {statusMessage || 'Processing with Gemini...'}
          </div>
        )}

      </div>
    );
  }

  // 3. Configuration Setup Screen with Lavender Accent
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] text-[10px] font-mono-label text-[var(--accent-interview)]">
          <Bot className="w-3 h-3" />
          <span>MOCK INTERVIEW · LAVENDER ACCENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
          Rehearse technical interviews with <span className="font-editorial-italic text-3xl sm:text-4xl">voice feedback</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
          Dynamic questions generated from your projects and target role. Speak or type answers to compile an executive report card.
        </p>
      </div>

      <div className="editorial-card p-6 sm:p-8 space-y-6 border-t-2 border-t-[var(--accent-interview)]">
        
        <div>
          <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-2">
            TARGET ROLE
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-interview)] min-h-[44px]"
          >
            {JOB_TITLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-2">
            DIFFICULTY LEVEL
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Easy', 'Medium', 'Hard'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`py-2.5 rounded-md text-xs font-mono-label font-bold border transition-colors min-h-[44px] ${
                  difficulty === lvl
                    ? 'border-[var(--accent-interview)] bg-[var(--bg-surface-elevated)] text-[var(--accent-interview)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="editorial-card-elevated p-4 space-y-2 text-xs text-[var(--text-secondary)]">
          <span className="font-mono-label text-[10px] text-[var(--text-primary)] block font-bold">HOW THE STUDIO WORKS</span>
          <p>• 5 targeted questions covering Technical, Project architecture, and STAR Behavioral categories.</p>
          <p>• Built-in speech recognition with automatic audio fallback to Gemini.</p>
          <p>• No mid-interview interrupts; full post-interview scoring report with 95%+ exemplar answers.</p>
        </div>

        <button
          onClick={handleStartInterview}
          disabled={loading}
          className="w-full py-3 px-6 rounded-md font-semibold text-xs text-white bg-[var(--accent-interview)] hover:opacity-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage || 'Preparing interview session...'}</span>
            </div>
          ) : (
            <>
              <span>Begin Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
