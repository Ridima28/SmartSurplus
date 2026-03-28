import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIExplanationProps {
  explanation: string;
  isLoading?: boolean;
}

const AIExplanation = ({ explanation, isLoading }: AIExplanationProps) => {
  return (
    <div className="ai-indicator rounded-lg border border-ai-glow/20 bg-ai-surface/50 p-4">
      <div className="relative z-10 flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-ai-glow/10 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-ai-glow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading text-sm font-semibold text-foreground">AI Insight</span>
            <Badge variant="ai" className="text-[10px]">Featherless AI</Badge>
          </div>
          {isLoading ? (
            <div className="ai-shimmer h-4 rounded w-3/4" />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIExplanation;
