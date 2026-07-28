"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  StudentProfile,
  emptyProfile,
  TrackedApplication,
  ApplicationStage,
  AppTask,
} from "./types";
import { getOpportunity } from "./seed";

// ---------------------------------------------------------------------------
// Client-side store. The MVP keeps the student's data in the browser
// (localStorage) so the whole experience is demonstrable without a backend.
// The shape mirrors the API contract in docs/API_SPEC.md, so swapping in real
// endpoints later is a drop-in change.
// ---------------------------------------------------------------------------

const PROFILE_KEY = "sizanani.profile.v1";
const APPS_KEY = "sizanani.apps.v1";

interface StoreValue {
  profile: StudentProfile;
  setProfile: (updater: (p: StudentProfile) => StudentProfile) => void;
  resetProfile: () => void;
  apps: Record<string, TrackedApplication>;
  saveOpportunity: (opportunityId: string) => void;
  removeOpportunity: (opportunityId: string) => void;
  setStage: (opportunityId: string, stage: ApplicationStage) => void;
  toggleTask: (opportunityId: string, taskId: string) => void;
  loaded: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function buildTasks(opportunityId: string): AppTask[] {
  const o = getOpportunity(opportunityId);
  if (!o) return [];
  const tasks: AppTask[] = [];
  o.requiredDocuments.forEach((doc, i) =>
    tasks.push({ id: `doc-${i}`, label: `Prepare & certify: ${doc}`, done: false })
  );
  if (o.essayRequired)
    tasks.push({ id: "essay", label: "Write motivational letter / essay", done: false });
  if (o.interviewRequired)
    tasks.push({ id: "interview", label: "Prepare for interview", done: false, blockedBy: "submit" });
  if (o.applicationFee && o.applicationFee > 0)
    tasks.push({ id: "fee", label: `Pay or request assistance for R${o.applicationFee} fee`, done: false });
  tasks.push({ id: "submit", label: "Submit application on the official portal", done: false });
  tasks.push({ id: "followup", label: "Follow up on the outcome", done: false, blockedBy: "submit" });
  return tasks;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile>(emptyProfile());
  const [apps, setApps] = useState<Record<string, TrackedApplication>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfileState({ ...emptyProfile(), ...JSON.parse(p) });
      const a = localStorage.getItem(APPS_KEY);
      if (a) setApps(JSON.parse(a));
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  }, [apps, loaded]);

  const setProfile = useCallback((updater: (p: StudentProfile) => StudentProfile) => {
    setProfileState((prev) => ({ ...updater(prev), updatedAt: new Date().toISOString() }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfileState(emptyProfile());
    setApps({});
  }, []);

  const saveOpportunity = useCallback((opportunityId: string) => {
    setApps((prev) => {
      if (prev[opportunityId]) return prev;
      return {
        ...prev,
        [opportunityId]: {
          opportunityId,
          stage: "Saved",
          tasks: buildTasks(opportunityId),
          savedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const removeOpportunity = useCallback((opportunityId: string) => {
    setApps((prev) => {
      const next = { ...prev };
      delete next[opportunityId];
      return next;
    });
  }, []);

  const setStage = useCallback((opportunityId: string, stage: ApplicationStage) => {
    setApps((prev) =>
      prev[opportunityId] ? { ...prev, [opportunityId]: { ...prev[opportunityId], stage } } : prev
    );
  }, []);

  const toggleTask = useCallback((opportunityId: string, taskId: string) => {
    setApps((prev) => {
      const app = prev[opportunityId];
      if (!app) return prev;
      const tasks = app.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
      // auto-advance stage based on task completion
      let stage = app.stage;
      const submit = tasks.find((t) => t.id === "submit");
      const docsDone = tasks.filter((t) => t.id.startsWith("doc-")).every((t) => t.done);
      if (submit?.done) stage = "Submitted";
      else if (docsDone && app.stage === "Saved") stage = "Ready to apply";
      else if (app.stage === "Saved") stage = "Preparing";
      return { ...prev, [opportunityId]: { ...app, tasks, stage } };
    });
  }, []);

  return (
    <StoreContext.Provider
      value={{ profile, setProfile, resetProfile, apps, saveOpportunity, removeOpportunity, setStage, toggleTask, loaded }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
