import React, { useState } from 'react';
import { Track, Playlist } from '../../types/music';
import { X, Check } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTracks: Track[];
  onCreate: (playlist: Playlist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  availableTracks,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState('/src/assets/images/album_city_night_1790520759013.jpg');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const covers = [
    '/src/assets/images/album_city_night_1790520759013.jpg',
    '/src/assets/images/album_lofi_room_1790520771235.jpg',
    '/src/assets/images/album_synth_sunset_1790520782238.jpg',
    '/src/assets/images/album_acoustic_forest_1790520792518.jpg',
  ];

  if (!isOpen) return null;

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || '내가 만든 특별한 플레이리스트',
      coverUrl: selectedCover,
      trackIds: selectedTrackIds.length > 0 ? selectedTrackIds : [availableTracks[0]?.id || ''],
      isCustom: true,
      createdAt: new Date().toLocaleDateString('ko-KR'),
    };

    onCreate(newPlaylist);
    setTitle('');
    setDescription('');
    setSelectedTrackIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h3 className="font-semibold text-neutral-100 text-base">새 플레이리스트 만들기</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              플레이리스트 제목 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 퇴근길 드라이브 무드, 밤샘 감성"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              설명
            </label>
            <textarea
              rows={2}
              placeholder="플레이리스트에 대한 간단한 소개를 적어보세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              커버 아트 선택
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {covers.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCover(c)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedCover === c
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={c}
                    alt="cover option"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedCover === c && (
                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              수록할 곡 선택 ({selectedTrackIds.length}곡 선택됨)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {availableTracks.map((t) => {
                const checked = selectedTrackIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTrack(t.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                      checked
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-neutral-100'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={t.coverUrl}
                        alt={t.title}
                        className="w-8 h-8 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{t.title}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-neutral-700'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow"
            >
              플레이리스트 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
