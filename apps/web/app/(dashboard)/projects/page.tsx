"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  PlusCircle,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { contents: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed");
      const project = await res.json();
      setProjects((prev) => [project, ...prev]);
      setOpen(false);
      setName("");
      setDescription("");
      toast.success("Project created!");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FolderOpen className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Projects</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={createProject} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="proj-name" className="text-slate-300">
                  Project name
                </Label>
                <Input
                  id="proj-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Content Campaign"
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-desc" className="text-slate-300">
                  Description (optional)
                </Label>
                <Textarea
                  id="proj-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-900 border-slate-700 animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <FolderOpen className="h-10 w-10 text-slate-600" />
            <p className="text-slate-400">No projects yet. Create your first one!</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-slate-900 border-slate-700 hover:border-slate-500 transition-colors"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">{project.name}</CardTitle>
                {project.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {project._count.contents} content
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
