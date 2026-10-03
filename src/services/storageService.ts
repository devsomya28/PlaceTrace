import { Application, StudentProfile, Experiment } from '../types/placement';
import { INITIAL_APPLICATIONS, INITIAL_STUDENT_PROFILE, INITIAL_EXPERIMENTS } from '../data/initialData';

const APPS_KEY = 'placetrace_applications_v1';
const PROFILE_KEY = 'placetrace_student_profile_v1';
const EXPERIMENTS_KEY = 'placetrace_experiments_v1';

export const storageService = {
  getApplications(): Application[] {
    try {
      const data = localStorage.getItem(APPS_KEY);
      if (!data) {
        this.saveApplications(INITIAL_APPLICATIONS);
        return INITIAL_APPLICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  saveApplications(apps: Application[]): void {
    try {
      localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications to localStorage', e);
    }
  },

  addApplication(app: Application): Application[] {
    const apps = this.getApplications();
    const updated = [app, ...apps];
    this.saveApplications(updated);
    return updated;
  },

  updateApplication(app: Application): Application[] {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === app.id);
    if (index !== -1) {
      apps[index] = app;
      this.saveApplications(apps);
    }
    return apps;
  },

  deleteApplication(id: string): Application[] {
    const apps = this.getApplications();
    const updated = apps.filter((a) => a.id !== id);
    this.saveApplications(updated);
    return updated;
  },

  resetToDemo(): Application[] {
    this.saveApplications(INITIAL_APPLICATIONS);
    this.saveProfile(INITIAL_STUDENT_PROFILE);
    this.saveExperiments(INITIAL_EXPERIMENTS);
    return INITIAL_APPLICATIONS;
  },

  getProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) {
        this.saveProfile(INITIAL_STUDENT_PROFILE);
        return INITIAL_STUDENT_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  },

  saveProfile(profile: StudentProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  getExperiments(): Experiment[] {
    try {
      const data = localStorage.getItem(EXPERIMENTS_KEY);
      if (!data) {
        this.saveExperiments(INITIAL_EXPERIMENTS);
        return INITIAL_EXPERIMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EXPERIMENTS;
    }
  },

  saveExperiments(experiments: Experiment[]): void {
    try {
      localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experiments));
    } catch (e) {
      console.error('Failed to save experiments to localStorage', e);
    }
  },

  updateExperiment(experiment: Experiment): Experiment[] {
    const list = this.getExperiments();
    const idx = list.findIndex((e) => e.id === experiment.id);
    if (idx !== -1) {
      list[idx] = experiment;
      this.saveExperiments(list);
    }
    return list;
  },

  exportDataJson(): string {
    const data = {
      applications: this.getApplications(),
      profile: this.getProfile(),
      experiments: this.getExperiments(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
};
