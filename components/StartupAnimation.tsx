import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/StartupAnimation.module.css';

interface FileEntry {
  name: string;
  permissions: string;
  links: number;
  owner: string;
  group: string;
  size: string;
  date: string;
  isDirectory: boolean;
  symlink?: string;
}

interface StartupAnimationProps {
  onComplete: () => void;
}

const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete }) => {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('StartupAnimation useEffect triggered');

    const fileEntries: FileEntry[] = [
      { name: "bin", permissions: "lrwxrwxrwx", links: 1, owner: "root", group: "root", size: "7", date: "999.M41", isDirectory: false, symlink: "usr/bin" },
      { name: "boot", permissions: "drwxr-xr-x", links: 2, owner: "root", group: "root", size: "4096", date: "001.M42", isDirectory: true },
      { name: "dev", permissions: "drwxr-xr-x", links: 16, owner: "root", group: "root", size: "3560", date: "995.M41", isDirectory: true },
      { name: "etc", permissions: "drwxr-xr-x", links: 93, owner: "root", group: "root", size: "4096", date: "998.M41", isDirectory: true },
      { name: "home", permissions: "drwxr-xr-x", links: 4, owner: "root", group: "root", size: "4096", date: "003.M42", isDirectory: true },
      { name: "lib", permissions: "lrwxrwxrwx", links: 1, owner: "root", group: "root", size: "7", date: "997.M41", isDirectory: false, symlink: "usr/lib" },
      { name: "lib32", permissions: "lrwxrwxrwx", links: 1, owner: "root", group: "root", size: "9", date: "996.M41", isDirectory: false, symlink: "usr/lib32" },
      { name: "lib64", permissions: "lrwxrwxrwx", links: 1, owner: "root", group: "root", size: "9", date: "996.M41", isDirectory: false, symlink: "usr/lib64" },
      { name: "libx32", permissions: "lrwxrwxrwx", links: 1, owner: "root", group: "root", size: "10", date: "996.M41", isDirectory: false, symlink: "usr/libx32" },
      { name: "lost+found", permissions: "drwx------", links: 2, owner: "root", group: "root", size: "16384", date: "750.M41", isDirectory: true },
      { name: "media", permissions: "drwxr-xr-x", links: 2, owner: "root", group: "root", size: "4096", date: "999.M41", isDirectory: true },
      { name: "mnt", permissions: "drwxr-xr-x", links: 12, owner: "root", group: "root", size: "4096", date: "005.M42", isDirectory: true },
      { name: "opt", permissions: "drwxr-xr-x", links: 2, owner: "root", group: "root", size: "4096", date: "002.M42", isDirectory: true },
      { name: "proc", permissions: "dr-xr-xr-x", links: 319, owner: "root", group: "root", size: "0", date: "999.M41", isDirectory: true },
      { name: "root", permissions: "drwx------", links: 8, owner: "root", group: "root", size: "4096", date: "004.M42", isDirectory: true }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fileEntries.length) {
        setEntries(prev => [...prev, fileEntries[currentIndex]]);
        currentIndex++;
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setShowSummary(true);
        setTimeout(() => {
          setShowConclusion(true);
          setTimeout(() => {
            console.log('Animation complete, calling onComplete');
            onComplete();
          }, 2000);
        }, 1000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalContent} ref={contentRef}>
        <div className={styles.header}>
          <span>Permissions</span>
          <span>Links</span>
          <span>Owner</span>
          <span>Group</span>
          <span>Size</span>
          <span>Date</span>
          <span>Name</span>
        </div>
        {entries.map((entry, index) => (
          <div key={index} className={styles.entry}>
            <span>{entry?.permissions || 'N/A'}</span>
            <span>{entry?.links || 'N/A'}</span>
            <span>{entry?.owner || 'N/A'}</span>
            <span>{entry?.group || 'N/A'}</span>
            <span>{entry?.size || 'N/A'}</span>
            <span>{entry?.date || 'N/A'}</span>
            <span className={entry?.isDirectory ? styles.directory : styles.file}>
              {entry?.name || 'N/A'}{entry?.symlink && ` -> ${entry.symlink}`}
            </span>
          </div>
        ))}
        {showSummary && (
          <div className={styles.summary}>
            {entries.length} directories
            <div className={styles.totalLine}>total 2288</div>
          </div>
        )}
        {showConclusion && (
          <div className={styles.conclusion}>
            Progress complete - Initializing dataslate...
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupAnimation;

