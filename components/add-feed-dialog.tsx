"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"

type AddFeedFormData = {
  title: string
  url: string
  siteUrl?: string
  description?: string
  format: "rss" | "atom" | "json"
}

export function AddFeedDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<AddFeedFormData>({
    defaultValues: {
      format: "rss",
    },
  })

  const onSubmit = async (data: AddFeedFormData) => {
    try {
      setIsLoading(true)
      
      // Add the feed
      const feedRes = await fetch("/api/feedinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!feedRes.ok) {
        const error = await feedRes.json()
        toast.error(error.error || "Failed to add feed")
        return
      }

      toast.success("Feed added successfully!")
      
      // Trigger indexing
      try {
        await fetch("/api/indexfeed", {
          method: "POST",
        })
        toast.success("Feed indexing started")
      } catch (indexError) {
        console.error("Indexing error:", indexError)
        toast.warning("Feed added but indexing failed to start")
      }

      // Refresh the feed entries
      await queryClient.invalidateQueries({ queryKey: ["entries"] })
      
      reset()
      setOpen(false)
    } catch (error) {
      console.error("Error adding feed:", error)
      toast.error("Failed to add feed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Feed</DialogTitle>
          <DialogDescription>
            Enter the RSS feed URL and details. The feed will be automatically indexed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Feed title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Feed URL *</Label>
            <Input
              id="url"
              placeholder="https://example.com/feed.xml"
              type="url"
              {...register("url", {
                required: "Feed URL is required",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Must be a valid URL",
                },
              })}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site URL</Label>
            <Input
              id="siteUrl"
              placeholder="https://example.com"
              type="url"
              {...register("siteUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Feed description (optional)"
              {...register("description")}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select defaultValue="rss" onValueChange={(value) => register("format").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rss">RSS</SelectItem>
                <SelectItem value="atom">Atom</SelectItem>
                <SelectItem value="json">JSON Feed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Feed"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
