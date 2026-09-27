import React, { useState } from 'react';
import { X, FolderPlus, Check, Plus, Tag, Sparkles } from 'lucide-react';
import { Track } from '../../types/music';
import { UserCategory } from '../../types/auth';

interface CategoryClassifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  categories: UserCategory[];
  onCreateCategory: (name: string, icon: string, color: string) => void;
  onToggleTrackInCategory: (categoryId: string, track: Track) => void;
}

const EMOJI_OPTIONS = ['📁', '🌙', '🚗', '☕', '⚡', '🎧', '🎸', '🔥', '💻', '🏖️', '🎹', '🎬'];
const COLOR_OPTIONS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899', '#8b5cf6'];

export const CategoryClassifyModal: React.FC<CategoryClassifyModalProps> = ({
  isOpen,
  onClose,
  track,
  categories,
  onCreateCategory,
  onToggleTrackInCategory,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  if (!isOpen || !track) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onCreateCategory(newCatName.trim(), selectedEmoji, selectedColor);
    setNewCatName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">카테고리별 분류하기</h3>
            <p className="text-xs text-neutral-400">원하는 카테고리에 영상을 분류하여 정리하세요</p>
          </div>
        </div>

        {/* Target Track Preview */}
        <div className="flex items-center gap-3 p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 mb-5">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-14 h-10 object-cover rounded-lg shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
            <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          {categories.length === 0 ? (
            <div className="text-center py-6 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-500">
              아직 생성된 카테고리가 없습니다. 아래에서 새 카테고리를 만들어보세요!
            </div>
          ) : (
            categories.map((cat) => {
              const isIncluded = cat.trackIds.includes(track.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => onToggleTrackInCategory(cat.id, track)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isIncluded
                      ? 'bg-neutral-800/90 border-red-500/50 text-white shadow'
                      : 'bg-neutral-950/50 border-neutral-800/80 hover:bg-neutral-800/40 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ({cat.trackIds.length}곡)
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[10px] text-neutral-400 truncate max-w-xs">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isIncluded
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}
                  >
                    {isIncluded && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Category Accordion / Inline Form */}
        {!isCreating ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-red-500" />
            <span>+ 새 카테고리 만들기</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreateSubmit}
            className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>새 카테고리 정보</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-neutral-500 hover:text-neutral-300 text-[11px]"
              >
                취소
              </button>
            </div>

            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="카테고리 이름 (예: ☕ 코딩할 때, 🚗 심야 드라이브)"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              autoFocus
              required
            />

            {/* Emoji and color pickers */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {EMOJI_OPTIONS.slice(0, 7).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-neutral-800 border border-neutral-600 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {COLOR_OPTIONS.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      selectedColor === c ? 'scale-125 ring-2 ring-white/60' : 'opacity-70'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              카테고리 생성 & 저장
            </button>
          </form>
        )}

        {/* Modal Done Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            분류 완료
          </button>
        </div>
      </div>
    </div>
  );
};
