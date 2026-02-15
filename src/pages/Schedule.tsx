import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSchedule } from '@/hooks/useSchedule';
import { CATEGORY_CONFIG, ScheduleTask, TaskCategory } from '@/types';
import { Upload, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_SLOTS = [
  '08:30', '09:40', '10:50', '11:50', '13:00', '14:10', '15:20', '16:20',
  '17:00', '18:10', '19:20', '20:30', '21:30', '22:30', '23:40', '00:40',
];

const colorClassMap: Record<string, string> = {
  'neon-cyan': 'bg-neon-cyan/15 border-neon-cyan/30 text-neon-cyan',
  'neon-green': 'bg-neon-green/15 border-neon-green/30 text-neon-green',
  'neon-purple': 'bg-neon-purple/15 border-neon-purple/30 text-neon-purple',
  'neon-orange': 'bg-neon-orange/15 border-neon-orange/30 text-neon-orange',
  'neon-pink': 'bg-neon-pink/15 border-neon-pink/30 text-neon-pink',
  'muted-foreground': 'bg-muted/30 border-muted/30 text-muted-foreground',
};

const statusBg: Record<string, string> = {
  pending: '',
  completed: 'opacity-50 line-through',
  missed: 'opacity-30',
};

const ScheduleView = () => {
  const {
    tasks,
    changeStatus,
    handleCSVImport,
    addNewTask,
    editTask,
    removeTask
  } = useSchedule();

  const fileRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<ScheduleTask> | null>(null);

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await handleCSVImport(text);
      toast.success('Schedule imported successfully!');
    } catch (err) {
      toast.error('Failed to import CSV.');
    }
  };

  const getTaskForSlot = (day: string, startTime: string): ScheduleTask | undefined => {
    return tasks.find(t => t.day === day && t.start_time === startTime);
  };

  const handleSaveTask = async () => {
    if (!selectedTask?.title || !selectedTask?.start_time || !selectedTask?.end_time) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      const taskData = {
        ...selectedTask,
        timeSlot: `${selectedTask.start_time} - ${selectedTask.end_time}`,
      } as ScheduleTask;

      if (taskData.id) {
        await editTask(taskData);
        toast.success("Task updated");
      } else {
        await addNewTask(taskData as Omit<ScheduleTask, 'id'>);
        toast.success("Task added");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save task");
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Weekly Schedule</h1>
            <p className="text-sm text-muted-foreground">Manage your study routine and projects</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileUpload} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" /> Import CSV
            </Button>
            <Button size="sm" onClick={() => {
              setSelectedTask({ day: currentDay, category: 'projects-research', status: 'pending', start_time: '08:30', end_time: '09:30' });
              setIsDialogOpen(true);
            }} className="gap-2">
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="glass-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[1000px]">
                {/* Header */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border">
                  <div className="p-3 text-xs text-muted-foreground font-medium">Time</div>
                  {DAYS.map((day, i) => (
                    <div key={day} className={`p-3 text-xs font-medium text-center border-l border-border ${day === currentDay ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
                      <span className="hidden md:inline">{day}</span>
                      <span className="md:hidden">{SHORT_DAYS[i]}</span>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/50 last:border-0">
                    <div className="p-2 text-xs text-muted-foreground flex items-center justify-center font-mono">{slot}</div>
                    {DAYS.map(day => {
                      const task = getTaskForSlot(day, slot);
                      if (!task) return <div key={`${day}-${slot}`} className="border-l border-border/50 p-1" />;
                      const cfg = CATEGORY_CONFIG[task.category];
                      const isCurrent = day === currentDay && currentTime >= task.start_time && currentTime < task.end_time;

                      return (
                        <motion.div key={`${day}-${slot}`} className="border-l border-border/50 p-1 relative group" whileHover={{ scale: 1.01 }}>
                          <div
                            onClick={() => {
                              const next = task.status === 'pending' ? 'completed' : task.status === 'completed' ? 'missed' : 'pending';
                              changeStatus(task.id, next);
                            }}
                            className={`rounded-md p-2 text-xs cursor-pointer border transition-all h-full ${colorClassMap[cfg.color]} ${statusBg[task.status]} ${isCurrent ? 'ring-1 ring-primary animate-glow' : ''}`}
                          >
                            <p className="font-medium text-foreground truncate text-[11px]">{task.title}</p>

                            {/* Edit/Delete Overlay */}
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setIsDialogOpen(true); }} className="p-1 bg-background/50 rounded hover:bg-background"><Pencil className="w-3 h-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete task?")) removeTask(task.id); }} className="p-1 bg-destructive/20 rounded hover:bg-destructive/40 text-destructive"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="glass-card sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedTask?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs">Title</Label>
                <Input value={selectedTask?.title || ''} onChange={(e) => setSelectedTask({ ...selectedTask!, title: e.target.value })} className="col-span-3 h-8 text-xs" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs">Day</Label>
                <Select value={selectedTask?.day} onValueChange={(v) => setSelectedTask({ ...selectedTask!, day: v })}>
                  <SelectTrigger className="col-span-3 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs">Start/End</Label>
                <div className="col-span-3 flex gap-2">
                  <Input type="time" value={selectedTask?.start_time} onChange={(e) => setSelectedTask({ ...selectedTask!, start_time: e.target.value })} className="h-8 text-xs" />
                  <Input type="time" value={selectedTask?.end_time} onChange={(e) => setSelectedTask({ ...selectedTask!, end_time: e.target.value })} className="h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs">Category</Label>
                <Select value={selectedTask?.category} onValueChange={(v: TaskCategory) => setSelectedTask({ ...selectedTask!, category: v })}>
                  <SelectTrigger className="col-span-3 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-xs pt-2">Notes</Label>
                <Textarea value={selectedTask?.description || ''} onChange={(e) => setSelectedTask({ ...selectedTask!, description: e.target.value })} className="col-span-3 text-xs" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveTask}>Save Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-4">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`w-3 h-3 rounded-sm ${colorClassMap[cfg.color]?.split(' ')[0] || 'bg-muted'}`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;