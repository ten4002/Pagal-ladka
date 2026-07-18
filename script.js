// Interactive scrapbook behavior for cover transitions, letter content, and the custom audio player
document.addEventListener("DOMContentLoaded", () => {
  const openBookButton = document.getElementById("openBook");

  if (openBookButton) {
    openBookButton.addEventListener("click", () => {
      document.body.classList.add("opening-book");
      openBookButton.disabled = true;
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 900);
    });
  }

  const letterCard = document.querySelector(".letter-card");
  if (letterCard) {
    setTimeout(() => {
      letterCard.classList.add("is-visible");
    }, 250);
  }

  const finalPage = document.querySelector(".final-page");
  if (finalPage) {
    document.body.classList.add("closing-book");
  }

  const noteData = {
    "miss-me": {
      title: "Open When You Miss Me",
      message:
        "When you miss me, I hope this note reminds you that love does not disappear when distance grows. It simply learns how to be gentle, patient, and brave. I am still here in your heart, in the quiet moments, and in every memory that makes you smile.",
      photo: "Images/1.jpeg",
      voiceLabel: "A soft note from my heart",
      audioFile: "Audio/audio1.mp3"
    },
    "laugh": {
      title: "Open When You Need A Laugh",
      message:
        "If life has felt too serious lately, I hope this little moment brings you a smile. Even the smallest laugh can feel like sunlight through a window. I hope you remember that joy still lives in your favorite memories and in the silly little things that make life feel lighter.",
      photo: "Images/2.jpeg",
      voiceLabel: "A tiny spark of comfort",
      audioFile: "Audio/audio2.mp3"
    },
    "doubt": {
      title: "Open When You Doubt Yourself",
      message:
        "Please remember that your softness is not weakness. Your kindness is not a flaw. You are stronger than you think, and every step you take with courage is already proof of the beautiful person you are becoming.",
      photo: "Images/3.jpeg",
      voiceLabel: "A warm reassurance",
      audioFile: "Audio/audio3.mp3"
    },
    "sleep": {
      title: "Open When You Can't Sleep",
      message:
        "When the night feels too long, let this page be a gentle pause. Breathe slowly, let your shoulders soften, and imagine the world settling into peace around you. Rest is allowed, and you are allowed to be held by stillness for a while.",
      photo: "Images/4.jpeg",
      voiceLabel: "A calm lullaby",
      audioFile: "Audio/audio4.mp3"
    },
    "hug": {
      title: "Open When You Need a Hug",
      message:
        "If you need comfort, I hope this reaches you like a warm embrace. A little tenderness can be enough for a day, a night, or a difficult moment. You deserve to feel cherished, even when the world feels a little heavy.",
      photo: "Images/5.jpeg",
      voiceLabel: "A cozy whisper",
      audioFile: "Audio/audio5.mp3"
    },
    "memories": {
      title: "Open When You Remember Our Memories",
      message:
        "Some memories stay with us not because they are perfect, but because they carry love. I hope when you think of us, you feel the sweetness of those moments and the quiet certainty that they still live in your heart.",
      photo: "Images/6.jpeg",
      voiceLabel: "A memory tucked in velvet",
      audioFile: "Audio/audio6.mp3"
    },
    "text": {
      title: "Open When You Think of Texting Me",
      message:
        "When you think of texting me, I hope it feels like a little bridge between our hearts. Even a simple message can carry warmth, comfort, and the feeling that we are still reaching for each other across any distance.",
      photo: "Images/7.jpeg",
      voiceLabel: "A sweet little message",
      audioFile: "Audio/audio7.mp3"
    },
    "travel": {
      title: "Open When You Are Traveling Somewhere",
      message:
        "When you are far away and the road feels long, remember that home is not only a place; it is also the comfort of being remembered. I hope your journey is gentle, your heart stays light, and your path keeps bringing you beautiful surprises.",
      photo: "Images/8.jpeg",
      voiceLabel: "A soft traveling wish",
      audioFile: "Audio/audio8.mp3"
    },
    "remember-us": {
      title: "Open When You Want to Remember Us",
      message:
        "If you want to remember us, let this be a soft reminder of all the little things that made our love feel real: the laughter, the quiet, the tenderness, and the way we made each other feel seen. We still live in those moments, and I hope they stay close to you.",
      photo: "Images/9.jpeg",
      voiceLabel: "A reminder of us",
      audioFile: "Audio/audio9.mp3"
    }
  };

  const pageTitle = document.getElementById("noteTitle");
  const pageMessage = document.getElementById("noteMessage");
  const pagePhoto = document.getElementById("notePhoto");
  const voiceLabel = document.getElementById("voiceLabel");
  const noteKey = new URLSearchParams(window.location.search).get("note") || "miss-me";

  if (pageTitle && pageMessage && pagePhoto && voiceLabel) {
    const note = noteData[noteKey] || noteData["miss-me"];
    pageTitle.textContent = note.title;
    pageMessage.textContent = note.message;
    pagePhoto.src = note.photo;
    pagePhoto.alt = note.title;
    voiceLabel.textContent = note.voiceLabel;
  }

  const playButton = document.getElementById("playAudio");
  const progressFill = document.getElementById("progressFill");
  const currentTime = document.getElementById("currentTime");
  const remainingTime = document.getElementById("remainingTime");
  const volumeSlider = document.getElementById("volumeSlider");

  if (playButton && progressFill && currentTime && remainingTime && volumeSlider) {
    let audioContext = null;
    let gainNode = null;
    let oscillator = null;
    let timerId = null;
    let startedAt = 0;
    let realAudio = null;
    let durationSeconds = 18;
    let usingRealAudio = false;
    const selectedNote = noteData[noteKey] || noteData["miss-me"];
    const audioFile = selectedNote?.audioFile || "";

    const formatTime = (value) => {
      const safeValue = Math.max(0, value);
      const minutes = String(Math.floor(safeValue / 60)).padStart(2, "0");
      const seconds = String(Math.floor(safeValue % 60)).padStart(2, "0");
      return `${minutes}:${seconds}`;
    };

    const setTimeline = (current, total) => {
      const safeTotal = Math.max(total || 18, 1);
      const safeCurrent = Math.min(current, safeTotal);
      const remaining = Math.max(safeTotal - safeCurrent, 0);
      progressFill.style.width = `${(safeCurrent / safeTotal) * 100}%`;
      currentTime.textContent = formatTime(safeCurrent);
      remainingTime.textContent = `-${formatTime(remaining)}`;
    };

    const updateTimeline = () => {
      if (usingRealAudio && realAudio) {
        const reportedDuration = Number(realAudio.duration);
        const resolvedDuration = Number.isFinite(reportedDuration) && reportedDuration > 0 ? reportedDuration : durationSeconds;
        durationSeconds = resolvedDuration;
        setTimeline(realAudio.currentTime, durationSeconds);
        if (realAudio.ended) {
          stopAudio();
        }
      } else {
        const elapsed = (Date.now() - startedAt) / 1000;
        setTimeline(elapsed, durationSeconds);
        if (elapsed >= durationSeconds) {
          stopAudio();
        }
      }
    };

    const stopAudio = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (realAudio) {
        realAudio.pause();
        realAudio.currentTime = 0;
        realAudio.removeEventListener("timeupdate", updateTimeline);
        realAudio.removeEventListener("ended", stopAudio);
        realAudio = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      usingRealAudio = false;
      playButton.textContent = "Play";
      setTimeline(0, durationSeconds);
    };

    const playSpeechFallback = () => {
      if (!("speechSynthesis" in window)) {
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(selectedNote.message);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = Number(volumeSlider.value);
      utterance.onend = () => {
        stopAudio();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      usingRealAudio = false;
      playButton.textContent = "Pause";
      startedAt = Date.now();
      timerId = setInterval(updateTimeline, 250);
      return true;
    };

    const playToneAudio = async () => {
      if (audioContext) {
        await audioContext.resume();
      } else {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      gainNode = audioContext.createGain();
      gainNode.gain.value = Number(volumeSlider.value);
      gainNode.connect(audioContext.destination);

      oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(560, audioContext.currentTime + 0.3);
      oscillator.connect(gainNode);
      oscillator.start();

      usingRealAudio = false;
      playButton.textContent = "Pause";
      startedAt = Date.now();
      timerId = setInterval(updateTimeline, 250);
    };

    const playRealAudio = async () => {
      const isSupportedAudioFile = audioFile && /\.(mp3|wav|ogg|m4a|aac)$/i.test(audioFile);
      if (!isSupportedAudioFile) {
        const spoke = playSpeechFallback();
        if (!spoke) {
          await playToneAudio();
        }
        return;
      }

      realAudio = new Audio(audioFile);
      realAudio.preload = "auto";
      realAudio.volume = Number(volumeSlider.value);
      realAudio.addEventListener("timeupdate", updateTimeline);
      realAudio.addEventListener("ended", stopAudio);
      realAudio.addEventListener("loadedmetadata", () => {
        const reportedDuration = Number(realAudio.duration);
        if (Number.isFinite(reportedDuration) && reportedDuration > 0) {
          durationSeconds = reportedDuration;
          setTimeline(0, durationSeconds);
        }
      });
      realAudio.addEventListener("durationchange", () => {
        const reportedDuration = Number(realAudio.duration);
        if (Number.isFinite(reportedDuration) && reportedDuration > 0) {
          durationSeconds = reportedDuration;
          setTimeline(0, durationSeconds);
        }
      });
      realAudio.addEventListener("canplaythrough", () => {
        const reportedDuration = Number(realAudio.duration);
        if (Number.isFinite(reportedDuration) && reportedDuration > 0) {
          durationSeconds = reportedDuration;
          setTimeline(0, durationSeconds);
        }
      });
      realAudio.addEventListener("error", () => {
        const spoke = playSpeechFallback();
        if (!spoke) {
          playToneAudio();
        }
      });

      try {
        await realAudio.play();
        usingRealAudio = true;
        playButton.textContent = "Pause";
        const reportedDuration = Number(realAudio.duration);
        if (Number.isFinite(reportedDuration) && reportedDuration > 0) {
          durationSeconds = reportedDuration;
        }
        setTimeline(0, durationSeconds);
        timerId = setInterval(updateTimeline, 250);
      } catch {
        const spoke = playSpeechFallback();
        if (!spoke) {
          await playToneAudio();
        }
      }
    };

    playButton.addEventListener("click", async () => {
      if (playButton.textContent === "Pause") {
        stopAudio();
      } else {
        await playRealAudio();
      }
    });

    volumeSlider.addEventListener("input", () => {
      const volumeValue = Number(volumeSlider.value);
      if (realAudio) {
        realAudio.volume = volumeValue;
      }
      if (gainNode) {
        gainNode.gain.value = volumeValue;
      }
    });
  }
});