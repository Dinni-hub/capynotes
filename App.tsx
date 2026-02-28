/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Search, 
  StickyNote, 
  Heart, 
  Calendar,
  X,
  Edit3,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Palette,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Square,
  CheckSquare,
  Paperclip,
  File
} from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
  size: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
  font: string;
  align: 'left' | 'center' | 'right' | 'justify';
  listType: 'none' | 'bullet-disc' | 'bullet-circle' | 'bullet-square' | 'bullet-arrow' | 'bullet-check' | 'number-decimal' | 'number-bracket' | 'number-roman' | 'number-roman-bracket' | 'number-roman-lower' | 'number-alpha-upper' | 'number-alpha-upper-bracket' | 'number-alpha-lower' | 'number-alpha-lower-dot' | 'number-roman-lower-bracket' | 'todo';
  attachments?: Attachment[];
}

const BULLET_STYLES = [
  { id: 'none', label: 'None', icon: 'None' },
  { id: 'bullet-disc', label: 'Disc', className: 'list-disc' },
  { id: 'bullet-circle', label: 'Circle', className: 'list-bullet-circle' },
  { id: 'bullet-square', label: 'Square', className: 'list-bullet-square' },
  { id: 'bullet-arrow', label: 'Arrow', className: 'list-bullet-arrow' },
  { id: 'bullet-check', label: 'Check', className: 'list-bullet-check' },
];

const NUMBER_STYLES = [
  { id: 'number-decimal', label: '1.', className: 'list-decimal' },
  { id: 'number-bracket', label: '1)', className: 'list-number-bracket' },
  { id: 'number-roman', label: 'I.', className: 'list-number-roman' },
  { id: 'number-roman-bracket', label: 'I)', className: 'list-number-roman-bracket' },
  { id: 'number-alpha-upper', label: 'A.', className: 'list-number-alpha-upper' },
  { id: 'number-alpha-upper-bracket', label: 'A)', className: 'list-number-alpha-upper-bracket' },
  { id: 'number-alpha-lower-dot', label: 'a.', className: 'list-number-alpha-lower-dot' },
  { id: 'number-alpha-lower', label: 'a)', className: 'list-number-alpha-lower' },
  { id: 'number-roman-lower', label: 'i.', className: 'list-number-roman-lower' },
  { id: 'number-roman-lower-bracket', label: 'i)', className: 'list-number-roman-lower-bracket' },
];

const COLORS = [
  '#FDF5E6', // Cream
  '#FFF9C4', // Pale Yellow
  '#FFECB3', // Amber
  '#D7CCC8', // Brown 100
  '#F5F5DC', // Beige
  '#E8F5E9', // Green 50
  '#F3E5F5', // Purple 50
];

const FONTS = [
  { name: 'Quicksand', value: 'font-sans' },
  { name: 'Playfair', value: 'font-serif' },
  { name: 'Mono', value: 'font-mono' },
  { name: 'Pacifico', value: 'font-cursive' },
  { name: 'Montserrat', value: 'font-montserrat' },
  { name: 'Hand', value: 'font-hand' },
];

const THEMES = [
  { name: 'Classic', id: 'theme-classic', accent: 'bg-brown-700', text: 'text-brown-900' },
  { name: 'Matcha', id: 'theme-matcha', accent: 'bg-green-800', text: 'text-green-900' },
  { name: 'Lavender', id: 'theme-lavender', accent: 'bg-purple-800', text: 'text-purple-900' },
  { name: 'Peach', id: 'theme-peach', accent: 'bg-orange-800', text: 'text-orange-900' },
  { name: 'Cocoa', id: 'theme-cocoa', accent: 'bg-cream-100', text: 'text-cream-100' },
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [currentTheme, setCurrentTheme] = useState('theme-classic');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedAlign, setSelectedAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [selectedList, setSelectedList] = useState<Note['listType']>('none');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [activeDropdown, setActiveDropdown] = useState<'font' | 'align' | 'number' | 'bullet' | 'attach' | null>(null);

  // Helper to convert number to Roman
  const toRoman = (num: number) => {
    const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  // Get marker for a specific line index and type
  const getMarker = (type: Note['listType'], index: number) => {
    switch (type) {
      case 'bullet-disc': return '• ';
      case 'bullet-circle': return '○ ';
      case 'bullet-square': return '■ ';
      case 'bullet-arrow': return '➢ ';
      case 'bullet-check': return '✓ ';
      case 'number-decimal': return `${index + 1}. `;
      case 'number-bracket': return `${index + 1}) `;
      case 'number-roman': return `${toRoman(index + 1)}. `;
      case 'number-roman-bracket': return `${toRoman(index + 1)}) `;
      case 'number-roman-lower': return `${toRoman(index + 1).toLowerCase()}. `;
      case 'number-alpha-upper': return `${String.fromCharCode(65 + (index % 26))}. `;
      case 'number-alpha-upper-bracket': return `${String.fromCharCode(65 + (index % 26))}) `;
      case 'number-alpha-lower': return `${String.fromCharCode(97 + (index % 26))}) `;
      case 'number-alpha-lower-dot': return `${String.fromCharCode(97 + (index % 26))}. `;
      case 'number-roman-lower-bracket': return `${toRoman(index + 1).toLowerCase()}) `;
      case 'todo': return '[ ] ';
      default: return '';
    }
  };

  // Remove existing markers from a line
  const stripMarkers = (line: string) => {
    // Regex to match various markers at the start of the line
    return line.replace(/^([•○■➢✓]|\d+[\.\)]|[IVXLCDMivxlcdm]+[\.\)]|[A-Za-z][\.\)]|\[[ x]\])\s*/, '');
  };

  // Apply formatting to the entire content
  const applyFormatting = (text: string, type: Note['listType']) => {
    if (type === 'none') {
      return text.split('\n').map(stripMarkers).join('\n');
    }
    return text.split('\n').map((line, i) => {
      const stripped = stripMarkers(line);
      return stripped ? getMarker(type, i) + stripped : '';
    }).join('\n');
  };

  // Handle list type change from toolbar (Apply only to current line)
  const handleListTypeChange = (type: Note['listType']) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Find the start and end of the current line
    const lines = value.split('\n');
    let currentPos = 0;
    let lineIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length;
      if (start >= currentPos && start <= lineEnd) {
        lineIndex = i;
        break;
      }
      currentPos = lineEnd + 1; // +1 for \n
    }

    const currentLine = lines[lineIndex];
    const stripped = stripMarkers(currentLine);
    const currentMarker = currentLine.substring(0, currentLine.length - stripped.length);
    
    if (type === 'none') {
      lines[lineIndex] = stripped;
    } else if (type === 'todo') {
      // Special toggle for todo: [ ] -> [x] -> none
      if (currentMarker === '[ ] ') {
        lines[lineIndex] = '[x] ' + stripped;
      } else if (currentMarker === '[x] ') {
        lines[lineIndex] = stripped;
      } else {
        lines[lineIndex] = '[ ] ' + stripped;
      }
    } else {
      const newMarker = getMarker(type, lineIndex);

      // Toggle logic: if same marker, remove it. If different or none, replace/add.
      if (currentMarker.trim() === newMarker.trim()) {
        lines[lineIndex] = stripped;
      } else {
        lines[lineIndex] = newMarker + stripped;
      }
    }

    const newValue = lines.join('\n');
    setContent(newValue);
    setActiveDropdown(null);
    
    // Maintain cursor position (approximate)
    setTimeout(() => {
      textarea.focus();
      const diff = lines[lineIndex].length - currentLine.length;
      textarea.selectionStart = textarea.selectionEnd = Math.max(0, start + diff);
    }, 0);
  };

  // Handle Enter key in textarea to continue lists based on current line's style
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Find the current line
      const beforeCursor = value.substring(0, start);
      const afterCursor = value.substring(end);
      const linesBefore = beforeCursor.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      
      // Detect marker on current line
      const stripped = stripMarkers(currentLine);
      const marker = currentLine.substring(0, currentLine.length - stripped.length);

      if (marker) {
        e.preventDefault();
        
        // If current line is just a marker, pressing enter removes it (ends list)
        if (!stripped.trim()) {
          const newValue = beforeCursor.substring(0, beforeCursor.length - currentLine.length) + '\n' + afterCursor;
          setContent(newValue);
          return;
        }

        // Determine list type from marker to get next marker
        let detectedType: Note['listType'] = 'none';
        if (marker.includes('•')) detectedType = 'bullet-disc';
        else if (marker.includes('○')) detectedType = 'bullet-circle';
        else if (marker.includes('■')) detectedType = 'bullet-square';
        else if (marker.includes('➢')) detectedType = 'bullet-arrow';
        else if (marker.includes('✓')) detectedType = 'bullet-check';
        else if (/^\d+\.\s/.test(marker)) detectedType = 'number-decimal';
        else if (/^\d+\)\s/.test(marker)) detectedType = 'number-bracket';
        else if (/^[IVXLCDM]+\.\s/.test(marker)) detectedType = 'number-roman';
        else if (/^[IVXLCDM]+\)\s/.test(marker)) detectedType = 'number-roman-bracket';
        else if (/^[ivxlcdm]+\.\s/.test(marker)) detectedType = 'number-roman-lower';
        else if (/^[A-Z]\.\s/.test(marker)) detectedType = 'number-alpha-upper';
        else if (/^[A-Z]\)\s/.test(marker)) detectedType = 'number-alpha-upper-bracket';
        else if (/^[a-z]\)\s/.test(marker)) detectedType = 'number-alpha-lower';
        else if (/^[a-z]\.\s/.test(marker)) detectedType = 'number-alpha-lower-dot';
        else if (/^[ivxlcdm]+\)\s/.test(marker)) detectedType = 'number-roman-lower-bracket';
        else if (/^\[[ x]\]\s/.test(marker)) detectedType = 'todo';

        const nextMarker = getMarker(detectedType, linesBefore.length);
        const newValue = beforeCursor + '\n' + nextMarker + afterCursor;
        
        setContent(newValue);
        
        // Set cursor position after the new marker
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + nextMarker.length;
        }, 0);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: type,
          url: event.target?.result as string,
          size: (file.size / 1024).toFixed(1) + ' KB'
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
    setActiveDropdown(null);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const toggleTodo = (lineIndex: number) => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    if (line.startsWith('[ ] ')) {
      lines[lineIndex] = line.replace('[ ] ', '[x] ');
    } else if (line.startsWith('[x] ')) {
      lines[lineIndex] = line.replace('[x] ', '[ ] ');
    }
    setContent(lines.join('\n'));
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const pos = textarea.selectionStart;
    const value = textarea.value;
    
    // Find the line at the click position
    const lines = value.split('\n');
    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineStart = currentPos;
      const lineEnd = currentPos + lines[i].length;
      
      if (pos >= lineStart && pos <= lineEnd) {
        // Check if the click was on the marker part (first 4 chars)
        const line = lines[i];
        if (pos >= lineStart && pos <= lineStart + 4) {
          if (line.startsWith('[ ] ')) {
            lines[i] = line.replace('[ ] ', '[x] ');
            setContent(lines.join('\n'));
            // Maintain cursor position
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = pos;
            }, 0);
            return;
          } else if (line.startsWith('[x] ')) {
            lines[i] = line.replace('[x] ', '[ ] ');
            setContent(lines.join('\n'));
            // Maintain cursor position
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = pos;
            }, 0);
            return;
          }
        }
        break;
      }
      currentPos = lineEnd + 1;
    }
  };

  // Load state from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('capy-notes');
    const savedTheme = localStorage.getItem('capy-theme');
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch (e) { console.error(e); }
    }
    if (savedTheme) setCurrentTheme(savedTheme);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('capy-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('capy-theme', currentTheme);
    document.body.className = currentTheme;
  }, [currentTheme]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && attachments.length === 0) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title || 'Untitled Note',
      content,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      color: selectedColor,
      font: selectedFont,
      align: selectedAlign,
      listType: selectedList,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setNotes([newNote, ...notes]);
    resetForm();
  };

  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    const updatedNotes = notes.map(n => 
      n.id === editingNote.id 
        ? { ...n, title, content, color: selectedColor, font: selectedFont, align: selectedAlign, listType: selectedList, attachments: attachments.length > 0 ? attachments : undefined } 
        : n
    );

    setNotes(updatedNotes);
    resetForm();
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color);
    setSelectedFont(note.font || FONTS[0].value);
    setSelectedAlign(note.align || 'left');
    setSelectedList(note.listType || 'none');
    setAttachments(note.attachments || []);
    setIsAdding(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedColor(COLORS[0]);
    setSelectedFont(FONTS[0].value);
    setSelectedAlign('left');
    setSelectedList('none');
    setAttachments([]);
    setIsAdding(false);
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = (note: Note) => {
    const lines = note.content.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, i) => {
          const isTodo = line.startsWith('[ ] ') || line.startsWith('[x] ');
          const isChecked = line.startsWith('[x] ');
          
          if (isTodo) {
            return (
              <div 
                key={i} 
                className="flex items-start gap-2 group/todo cursor-pointer w-full py-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  const newNotes = notes.map(n => {
                    if (n.id === note.id) {
                      const newLines = n.content.split('\n');
                      // Toggle between [ ] and [x]
                      if (newLines[i].startsWith('[x] ')) {
                        newLines[i] = newLines[i].replace('[x] ', '[ ] ');
                      } else if (newLines[i].startsWith('[ ] ')) {
                        newLines[i] = newLines[i].replace('[ ] ', '[x] ');
                      }
                      return { ...n, content: newLines.join('\n') };
                    }
                    return n;
                  });
                  setNotes(newNotes);
                }}
              >
                <div className="mt-1 flex-shrink-0 text-brown-900/60 group-hover/todo:text-brown-900 transition-colors">
                  {isChecked ? <CheckSquare className="w-4.5 h-4.5 text-blue-600" /> : <Square className="w-4.5 h-4.5" />}
                </div>
                <span className={`text-sm flex-1 ${isChecked ? 'line-through opacity-40' : 'text-brown-800'}`}>
                  {line.substring(4)}
                </span>
              </div>
            );
          }
          return <p key={i} className="text-sm whitespace-pre-wrap">{line}</p>;
        })}
        
        {note.attachments && note.attachments.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2">
            {note.attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 px-2 py-1 bg-black/5 rounded-lg border border-black/5 max-w-[150px]">
                {att.type === 'image' ? <ImageIcon className="w-3 h-3 opacity-40" /> : <FileText className="w-3 h-3 opacity-40" />}
                <span className="text-[10px] font-bold truncate flex-1">{att.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen pb-20 ${currentTheme}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-inherit/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/Dinni-hub/kapibara.v1/main/Kapibara/Capybara%20Cute%201440x2560%20Resolution.jpg" 
                alt="Capybara Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CapyNotes</h1>
              <p className="text-[10px] opacity-60 font-medium uppercase tracking-widest">Stay Chill, Take Notes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input 
                type="text" 
                placeholder="Cari catatan..." 
                className="bg-white/50 border border-black/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Mobile Search */}
        <div className="md:hidden mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text" 
            placeholder="Cari catatan..." 
            className="w-full bg-white/50 border border-black/5 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                onClick={() => startEditing(note)}
                className="capy-card p-5 flex flex-col gap-3 relative group overflow-hidden cursor-pointer"
                style={{ backgroundColor: note.color }}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-brown-900 text-lg leading-tight ${note.font}`}>{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(note)} className="p-1.5 hover:bg-black/5 rounded-lg text-brown-700"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className={`text-brown-800 text-sm flex-grow line-clamp-4 sm:line-clamp-6 ${note.font}`} style={{ textAlign: note.align as any }}>
                  {renderContent(note)}
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-black/5">
                  <div className="flex items-center gap-1.5 text-[10px] opacity-60 font-medium">
                    <Calendar className="w-3 h-3" />
                    {note.date}
                  </div>
                  <Heart className="w-4 h-4 text-brown-300 fill-current" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 gap-4">
              <img 
                src="https://raw.githubusercontent.com/Dinni-hub/kapibara.v1/main/Kapibara/Capybara%20Cute%201440x2560%20Resolution.jpg" 
                alt="Empty Capybara"
                className="w-32 h-48 object-contain grayscale"
                referrerPolicy="no-referrer"
              />
              <p className="font-medium">Belum ada catatan. Ayo buat satu!</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAdding(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#3e2723] text-white rounded-full shadow-2xl flex items-center justify-center z-20"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: selectedColor }}
            >
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 no-scrollbar">
                <div className="flex flex-col items-center mb-4 sm:mb-8">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-24 h-36 sm:w-32 sm:h-48 overflow-hidden mb-2"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/Dinni-hub/kapibara.v1/main/Kapibara/Capybara%20Cute%201440x2560%20Resolution.jpg" 
                      alt="Greeting Capybara"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <p className="text-[10px] sm:text-xs font-bold text-brown-900/60 uppercase tracking-widest">Halo! Mau catat apa hari ini?</p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-brown-900 flex items-center gap-2">
                    {editingNote ? <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" /> : <StickyNote className="w-5 h-5 sm:w-6 sm:h-6" />}
                    {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
                  </h2>
                  <button onClick={resetForm} className="p-2 hover:bg-black/5 rounded-full text-brown-700"><X className="w-6 h-6" /></button>
                </div>

                {/* Custom Dropdown Toolbar */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 p-2 bg-black/5 rounded-2xl relative">
                  {/* Alignment Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'align' ? null : 'align')}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 rounded-xl shadow-sm hover:bg-white transition-all"
                    >
                      {selectedAlign === 'left' && <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {selectedAlign === 'center' && <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {selectedAlign === 'right' && <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {selectedAlign === 'justify' && <AlignJustify className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${activeDropdown === 'align' ? 'rotate-180' : ''} opacity-40`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'align' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-black/5 z-[60] overflow-hidden"
                        >
                          {[
                            { id: 'left', label: 'Rata Kiri', icon: <AlignLeft className="w-4 h-4" /> },
                            { id: 'center', label: 'Rata Tengah', icon: <AlignCenter className="w-4 h-4" /> },
                            { id: 'right', label: 'Rata Kanan', icon: <AlignRight className="w-4 h-4" /> },
                            { id: 'justify', label: 'Rata Kanan Kiri', icon: <AlignJustify className="w-4 h-4" /> }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => { setSelectedAlign(opt.id as any); setActiveDropdown(null); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                                selectedAlign === opt.id ? 'bg-[#3b82f6] text-white' : 'hover:bg-black/5 text-brown-800'
                              }`}
                            >
                              {opt.icon}
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Font Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 rounded-xl shadow-sm hover:bg-white transition-all"
                    >
                      <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
                      <span className="text-[10px] sm:text-sm font-bold text-brown-900 min-w-[60px] sm:min-w-[80px] text-left truncate">
                        {FONTS.find(f => f.value === selectedFont)?.name}
                      </span>
                      <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${activeDropdown === 'font' ? 'rotate-180' : ''} opacity-40`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'font' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-black/5 z-[60] overflow-hidden"
                        >
                          {FONTS.map((f) => (
                            <button
                              key={f.value}
                              type="button"
                              onClick={() => { setSelectedFont(f.value); setActiveDropdown(null); }}
                              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                                selectedFont === f.value ? 'bg-[#3b82f6] text-white' : 'hover:bg-black/5 text-brown-800'
                              } ${f.value}`}
                            >
                              {f.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Numbering Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'number' ? null : 'number')}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 rounded-xl shadow-sm hover:bg-white transition-all"
                    >
                      <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
                      <span className="text-[10px] sm:text-sm font-bold text-brown-900">123</span>
                      <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${activeDropdown === 'number' ? 'rotate-180' : ''} opacity-40`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'number' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-black/5 z-[60] overflow-y-auto max-h-[300px] no-scrollbar"
                        >
                          <button
                            type="button"
                            onClick={() => handleListTypeChange('none')}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium hover:bg-black/5 text-brown-800 border-b border-black/5"
                          >
                            None
                          </button>
                          {NUMBER_STYLES.map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleListTypeChange(style.id as any)}
                              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                                selectedList === style.id ? 'bg-[#3b82f6] text-white' : 'hover:bg-black/5 text-brown-800'
                              }`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bullet Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'bullet' ? null : 'bullet')}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 rounded-xl shadow-sm hover:bg-white transition-all"
                    >
                      <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
                      <span className="text-[10px] sm:text-sm font-bold text-brown-900">List</span>
                      <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${activeDropdown === 'bullet' ? 'rotate-180' : ''} opacity-40`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'bullet' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-black/5 z-[60] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => handleListTypeChange('none')}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium hover:bg-black/5 text-brown-800 border-b border-black/5"
                          >
                            None
                          </button>
                          {BULLET_STYLES.filter(s => s.id !== 'none').map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleListTypeChange(style.id as any)}
                              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                                selectedList === style.id ? 'bg-[#3b82f6] text-white' : 'hover:bg-black/5 text-brown-800'
                              }`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Checklist Button */}
                  <button 
                    type="button"
                    onClick={() => handleListTypeChange('todo')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm transition-all ${
                      selectedList === 'todo' ? 'bg-[#3b82f6] text-white' : 'bg-white/60 hover:bg-white text-brown-900'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
                    <span className="text-[10px] sm:text-sm font-bold">Todo</span>
                  </button>

                  {/* Attach Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'attach' ? null : 'attach')}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 rounded-xl shadow-sm hover:bg-white transition-all"
                    >
                      <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
                      <span className="text-[10px] sm:text-sm font-bold text-brown-900">File</span>
                      <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${activeDropdown === 'attach' ? 'rotate-180' : ''} opacity-40`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'attach' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-black/5 z-[60] overflow-hidden"
                        >
                          <label className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-black/5 text-brown-800 cursor-pointer transition-colors">
                            <ImageIcon className="w-4 h-4 opacity-40" />
                            Gambar / Galeri
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} multiple />
                          </label>
                          <label className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-black/5 text-brown-800 cursor-pointer transition-colors">
                            <File className="w-4 h-4 opacity-40" />
                            Dokumen (Word/Excel)
                            <input type="file" accept=".doc,.docx,.xls,.xlsx,.pdf,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} multiple />
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <form onSubmit={editingNote ? handleUpdateNote : handleAddNote} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Judul"
                    className={`w-full bg-transparent border-b-2 border-black/5 py-2 text-xl font-bold text-brown-900 focus:outline-none focus:border-black/10 placeholder:text-brown-900/30 ${selectedFont}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                  
                  <div className="relative group">
                    <textarea
                      placeholder="Tulis sesuatu yang santai..."
                      className={`w-full bg-transparent py-2 text-brown-800 focus:outline-none min-h-[200px] sm:min-h-[300px] resize-none placeholder:text-brown-800/40 ${selectedFont}`}
                      style={{ textAlign: selectedAlign as any }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onClick={handleTextareaClick}
                    />

                    {/* Attachments Preview in Modal */}
                    {attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Lampiran</h3>
                        <div className="flex flex-wrap gap-3">
                          {attachments.map((att) => (
                            <div key={att.id} className="group relative flex items-center gap-3 p-2 bg-white/40 rounded-xl border border-black/5 min-w-[140px] max-w-[200px]">
                              <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
                                {att.type === 'image' ? <ImageIcon className="w-4 h-4 opacity-40" /> : <FileText className="w-4 h-4 opacity-40" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-brown-900">{att.name}</p>
                                <p className="text-[10px] opacity-40">{att.size}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeAttachment(att.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center justify-between pt-4 sm:pt-6 border-t border-black/5 gap-4">
                    <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-black scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <button type="submit" className="w-12 h-12 sm:w-auto sm:px-8 sm:py-3 rounded-full sm:rounded-2xl font-bold bg-[#3e2723] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 sm:gap-3 text-lg shrink-0 shadow-md">
                      {editingNote ? <Check className="w-6 h-6 sm:w-5 sm:h-5" /> : <Plus className="w-6 h-6 sm:w-5 sm:h-5" />}
                      <span className="hidden sm:inline">{editingNote ? 'Simpan Catatan' : 'Tambah Catatan'}</span>
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none overflow-hidden p-6 sm:p-12">
                <img 
                  src="https://raw.githubusercontent.com/Dinni-hub/kapibara.v1/main/Kapibara/Capybara%20Cute%201440x2560%20Resolution.jpg" 
                  alt="Background Capybara"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
