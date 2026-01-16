import React, { useState, useEffect, useCallback, useRef } from 'react';
import { performOCR } from './services/geminiService';
import { AppState, HistoryItem } from './types';
import { Button } from './components/Button';
import { HistoryList } from './components/HistoryList';

// Constants
const USERNAME = "ufrgs";
const PASSWORD = "SnkyEA6L5vrbvFR7zgbQ";
const STORAGE_KEY = "ufrgs_ocr_history";

export default function App() {
  // State: Auth
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // State: OCR Logic
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State: History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === USERNAME && loginPass === PASSWORD) {
      setAppState(AppState.DASHBOARD);
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas. Tente novamente.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      setOcrText('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeOCR = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setOcrText('');

    try {
      const text = await performOCR(selectedImage);
      setOcrText(text);

      // Save to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        thumbnail: selectedImage, // In a real app, generate a small thumbnail
        text: text
      };

      // Keep only last 10 items to save localStorage space
      setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      setErrorMsg(err.message || "Erro desconhecido ao processar imagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      alert("Texto copiado para a área de transferência!");
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setSelectedImage(item.thumbnail);
    setOcrText(item.text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    if (window.confirm("Tem certeza que deseja apagar todo o histórico?")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleLogout = () => {
    setAppState(AppState.LOGIN);
    setLoginUser('');
    setLoginPass('');
    setSelectedImage(null);
    setOcrText('');
  };

  // --- Render: Login Screen ---
  if (appState === AppState.LOGIN) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-ufrgs-blue p-6 text-center border-b-4 border-ufrgs-red">
            <h1 className="text-2xl font-bold text-white tracking-wide">UFRGS</h1>
            <p className="text-blue-200 text-sm mt-1">Portal de Reconhecimento Óptico</p>
          </div>
          
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Autenticação</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input 
                  type="text" 
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ufrgs-blue focus:border-ufrgs-blue outline-none transition"
                  placeholder="Identificação UFRGS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ufrgs-blue focus:border-ufrgs-blue outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              
              {loginError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  {loginError}
                </div>
              )}

              <Button type="submit" className="mt-4">
                Entrar
              </Button>
            </form>
          </div>
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Universidade Federal do Rio Grande do Sul
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Dashboard ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-ufrgs-blue shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-ufrgs-red rounded-sm"></div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">UFRGS</h1>
              <span className="text-blue-200 text-xs uppercase tracking-wider">OCR Inteligente</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-white text-sm hover:bg-blue-800 px-3 py-1 rounded transition-colors border border-blue-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-ufrgs-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Captura de Imagem
                </h2>
                
                <div className="flex flex-col gap-4">
                  <label className="block w-full cursor-pointer group">
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 group-hover:bg-blue-50 group-hover:border-ufrgs-blue transition-colors">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-ufrgs-blue mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-sm text-gray-600 font-medium">Clique para selecionar ou tirar foto</span>
                      <span className="text-xs text-gray-400 mt-1">Formatos suportados: JPG, PNG</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>

                  {selectedImage && (
                    <div className="mt-4 border rounded-lg p-2 bg-gray-50">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded shadow-sm object-contain" 
                      />
                    </div>
                  )}

                  <Button 
                    onClick={executeOCR} 
                    disabled={!selectedImage} 
                    isLoading={isProcessing}
                    className="mt-2"
                  >
                    {isProcessing ? "Processando com Gemini AI..." : "Extrair Texto (OCR)"}
                  </Button>

                  {errorMsg && (
                    <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded text-sm mt-2">
                      {errorMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Result Card */}
            {ocrText && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Resultado da Extração</h2>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-sm text-ufrgs-blue font-medium hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copiar
                  </button>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {ocrText}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: History Sidebar */}
          <div className="lg:col-span-1">
            <HistoryList 
              history={history} 
              onSelect={handleHistorySelect} 
              onClear={clearHistory}
            />
          </div>

        </div>
      </main>
    </div>
  );
}