"use client";

import { useState } from "react";
import { SendMessageRequestDTO } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Image as ImageIcon, MapPin, Send, Loader2 } from "lucide-react";
import { MapLocationSelectorModal } from "@/components/modals/MapLocationSelectorModal";

interface ChatMessageInputProps {
  onSend: (req: SendMessageRequestDTO) => Promise<void> | void;
  disabled?: boolean;
}

export function ChatMessageInput({ onSend, disabled = false }: ChatMessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Image URL State
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Map Location State
  const [mapOpen, setMapOpen] = useState(false);

  const handleSendText = async () => {
    if (!text.trim() || sending || disabled) return;
    
    setSending(true);
    try {
      await onSend({
        messageType: "TEXT",
        textContent: text.trim(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to send text message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async () => {
    if (!imageUrl.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend({
        messageType: "IMAGE",
        fileUrl: imageUrl.trim(),
      });
      setImageUrl("");
      setImageOpen(false);
    } catch (err) {
      console.error("Failed to send image message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectLocation = async (loc: { latitude: number; longitude: number }) => {
    if (sending || disabled) return;

    setSending(true);
    try {
      await onSend({
        messageType: "LOCATION",
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
    } catch (err) {
      console.error("Failed to send location message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full h-10 w-10 border-border hover:bg-muted"
              disabled={sending || disabled}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-48 p-1.5 rounded-lg border-border shadow-md">
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                className="justify-start gap-2 h-9 text-xs"
                onClick={() => {
                  setPopoverOpen(false);
                  setImageOpen(true);
                }}
              >
                <ImageIcon className="h-4 w-4 text-primary" />
                Attach Image URL
              </Button>
              
              <Button
                variant="ghost"
                className="justify-start gap-2 h-9 text-xs"
                onClick={() => {
                  setPopoverOpen(false);
                  setMapOpen(true);
                }}
              >
                <MapPin className="h-4 w-4 text-secondary" />
                Share Location Pin
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-muted/30 border-border rounded-full px-5 py-2.5 text-sm focus-visible:ring-primary focus-visible:ring-1"
          disabled={sending || disabled}
        />

        <Button
          type="button"
          onClick={handleSendText}
          disabled={!text.trim() || sending || disabled}
          className="shrink-0 rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center p-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4.5 w-4.5" />
          )}
        </Button>
      </div>

      {/* Image URL dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-sm rounded-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Send Image URL
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
            <Input
              placeholder="Paste link to already uploaded image..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="text-xs"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" size="sm" onClick={() => setImageOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleSendImage} disabled={!imageUrl.trim() || sending} size="sm" className="text-xs bg-primary text-primary-foreground">
              Send Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map location selector modal */}
      <MapLocationSelectorModal
        open={mapOpen}
        onOpenChange={setMapOpen}
        onSelect={handleSelectLocation}
      />
    </div>
  );
}
export default ChatMessageInput;
