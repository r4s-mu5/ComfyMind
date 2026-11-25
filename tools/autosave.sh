#!/bin/bash
# Autosave: commit + push all work every 3 minutes (no model usage needed).
cd /home/user/ComfyMind || exit 1
BR=claude/art-therapy-gui-redesign-8c2ik9
while true; do
  if [ -n "$(git status --porcelain)" ]; then
    for i in 1 2 3; do
      rm -f .git/index.lock 2>/dev/null
      git add -A && git commit -q -m "autosave: work in progress $(date -u +%H:%M)Z

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Kk9Ps64XG2jxb5VeaSqfrE" && break
      sleep 5
    done
  fi
  if [ -n "$(git log origin/$BR..$BR --oneline 2>/dev/null)" ]; then
    for d in 2 4 8 16; do git push -q origin $BR 2>/dev/null && break; sleep $d; done
  fi
  echo "$(date -u +%H:%M:%S) ok $(git log --oneline -1)" >> /tmp/comfymind-autosave.log
  sleep 180
done
