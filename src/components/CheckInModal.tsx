import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { checkInApi } from '@/services/api';
import { CheckInFormData } from '@/types';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitId: string;
  userId: string;
  onCheckInComplete: () => void;
}

const CHALLENGES = [
  'Physical fatigue',
  'Mental exhaustion',
  'Time constraints',
  'Distractions',
  'Lack of motivation',
  'Environmental factors',
];

const MOTIVATIONS = [
  'Personal goal',
  'External accountability',
  'Immediate reward',
  'Long-term benefits',
  'Support from others',
];

const SABOTAGE_PATTERNS = [
  'Procrastination',
  'Perfectionism',
  'All-or-nothing thinking',
  'Negative self-talk',
  'Comparison with others',
];

const CheckInModal = ({ open, onOpenChange, habitId, userId, onCheckInComplete }: CheckInModalProps) => {
  const [formData, setFormData] = useState<CheckInFormData>({
    status: 'completed',
    challenges: [],
    motivations: [],
    sabotagePatterns: [],
    timeOfDay: undefined,
    energy: { level: 5, satisfaction: 5, mood: 5 },
    reflection: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await checkInApi.createCheckIn({
        habitId,
        userId,
        date: new Date(),
        status: formData.status,
        challenges: formData.challenges,
        sabotagePatterns: [],
        motivations: formData.motivations,
        energy: formData.energy,
        reflection: formData.reflection,
      });

      toast({
        title: 'Check-in Complete! 🎉',
        description: 'Great work! Your progress has been recorded.',
      });

      onCheckInComplete();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save check-in. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      status: 'completed',
      challenges: [],
      motivations: [],
      sabotagePatterns: [],
      timeOfDay: undefined,
      energy: { level: 5, satisfaction: 5, mood: 5 },
      reflection: '',
    });
  };

  const toggleChallenge = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const toggleMotivation = (motivation: string) => {
    setFormData((prev) => ({
      ...prev,
      motivations: prev.motivations.includes(motivation)
        ? prev.motivations.filter((m) => m !== motivation)
        : [...prev.motivations, motivation],
    }));
  };

  const toggleSabotage = (pattern: string) => {
    setFormData((prev) => ({
      ...prev,
      sabotagePatterns: prev.sabotagePatterns.includes(pattern)
        ? prev.sabotagePatterns.filter((p) => p !== pattern)
        : [...prev.sabotagePatterns, pattern],
    }));
  };

  const handleTimeOfDayChange = (time: 'morning' | 'afternoon' | 'evening') => {
    setFormData((prev) => ({
      ...prev,
      timeOfDay: time,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Today's Check-In</DialogTitle>
          <DialogDescription>
            Reflect on your progress and be honest with yourself. Every insight helps you grow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Status */}
          <div className="space-y-3">
            <Label>How did it go today?</Label>
            <RadioGroup value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-transparent hover:border-success/20 transition-colors">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Fully Completed</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-transparent hover:border-warning/20 transition-colors">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="flex items-center gap-2 cursor-pointer flex-1">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span>Partially Completed</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-transparent hover:border-destructive/20 transition-colors">
                <RadioGroupItem value="missed" id="missed" />
                <Label htmlFor="missed" className="flex items-center gap-2 cursor-pointer flex-1">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span>Not Completed</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Challenges */}
          <div className="space-y-3">
            <Label>What challenges did you face? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {CHALLENGES.map((challenge) => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={formData.challenges.includes(challenge)}
                    onCheckedChange={() => toggleChallenge(challenge)}
                  />
                  <Label htmlFor={challenge} className="text-sm cursor-pointer">
                    {challenge}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Motivations */}
          <div className="space-y-3">
            <Label>What motivated you today?</Label>
            <div className="grid grid-cols-2 gap-3">
              {MOTIVATIONS.map((motivation) => (
                <div key={motivation} className="flex items-center space-x-2">
                  <Checkbox
                    id={motivation}
                    checked={formData.motivations.includes(motivation)}
                    onCheckedChange={() => toggleMotivation(motivation)}
                  />
                  <Label htmlFor={motivation} className="text-sm cursor-pointer">
                    {motivation}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sabotage Patterns */}
          <div className="space-y-3">
            <Label>Did you experience any self-sabotage?</Label>
            <div className="grid grid-cols-2 gap-3">
              {SABOTAGE_PATTERNS.map((pattern) => (
                <div key={pattern} className="flex items-center space-x-2">
                  <Checkbox
                    id={pattern}
                    checked={formData.sabotagePatterns.includes(pattern)}
                    onCheckedChange={() => toggleSabotage(pattern)}
                  />
                  <Label htmlFor={pattern} className="text-sm cursor-pointer">
                    {pattern}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="space-y-3">
            <Label>When did you work on this habit?</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={formData.timeOfDay === 'morning' ? 'default' : 'outline'}
                onClick={() => handleTimeOfDayChange('morning')}
                className="w-full"
              >
                Morning
              </Button>
              <Button
                type="button"
                variant={formData.timeOfDay === 'afternoon' ? 'default' : 'outline'}
                onClick={() => handleTimeOfDayChange('afternoon')}
                className="w-full"
              >
                Afternoon
              </Button>
              <Button
                type="button"
                variant={formData.timeOfDay === 'evening' ? 'default' : 'outline'}
                onClick={() => handleTimeOfDayChange('evening')}
                className="w-full"
              >
                Evening
              </Button>
            </div>
          </div>

          {/* Energy Levels */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Energy Level: {formData.energy.level}/10</Label>
              <Slider
                value={[formData.energy.level]}
                onValueChange={([value]) => setFormData({ ...formData, energy: { ...formData.energy, level: value } })}
                max={10}
                min={1}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Satisfaction: {formData.energy.satisfaction}/10</Label>
              <Slider
                value={[formData.energy.satisfaction]}
                onValueChange={([value]) => setFormData({ ...formData, energy: { ...formData.energy, satisfaction: value } })}
                max={10}
                min={1}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Mood: {formData.energy.mood}/10</Label>
              <Slider
                value={[formData.energy.mood]}
                onValueChange={([value]) => setFormData({ ...formData, energy: { ...formData.energy, mood: value } })}
                max={10}
                min={1}
                step={1}
              />
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-2">
            <Label htmlFor="reflection">Reflection (Optional)</Label>
            <Textarea
              id="reflection"
              placeholder="What did you learn about yourself today?"
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Check-In
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
