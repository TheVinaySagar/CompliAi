"use client"

import React, { memo, useState, useCallback } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message, Source } from "@/types"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Check, FileText, Book, Download, LinkIcon } from "lucide-react"
import { cn, copyToClipboard } from "@/lib/utils"

interface ChatBubbleProps {
  message: Message
  onGeneratePolicy?: (action: string) => void
}

// Custom components for react-markdown
const MarkdownComponents = {
  // Custom code block with copy functionality
  code: ({ node, inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false)
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : 'text'

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(String(children))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }

    if (!inline) {
      return (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 my-4">
          <div className="flex items-center justify-between px-4 py-2 text-xs bg-gray-200 text-gray-600 border-b">
            <span className="font-medium">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-300"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-4 text-sm font-mono text-gray-800">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              <code {...props}>{children}</code>
            </pre>
          </div>
        </div>
      )
    }

    return (
      <code className="px-2 py-1 text-sm font-mono rounded bg-gray-200 text-gray-800" {...props}>
        {children}
      </code>
    )
  },

  // Custom styling for different elements
  h1: ({ children }: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-300 pb-2">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900">{children}</h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800">{children}</h4>
  ),
  p: ({ children }: any) => (
    <p className="leading-relaxed text-base mb-4">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-2 ml-4 mb-4">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="space-y-2 ml-4 mb-4 list-decimal">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start">
      <span className="flex-1 leading-relaxed">{children}</span>
    </li>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-300" />
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="text-gray-700">{children}</em>
  ),
}

// Enhanced source component with better information display
const SourceCard = memo(({ source, index }: { source: Source; index: number }) => {
  const getSourceIcon = useCallback((source: Source) => {
    if (source.type === 'document' || source.filename) return FileText
    if (source.type === 'standard' || source.framework) return Book
    return LinkIcon
  }, [])

  const getSourceUrl = useCallback((source: Source) => {
    if (source.url) return source.url
    if (source.link) return source.link
    if (source.filename && source.document_id) {
      return `/documents/${source.document_id}`
    }
    return null
  }, [])

  const handleSourceClick = useCallback(() => {
    const url = getSourceUrl(source)
    if (url) {
      window.open(url, '_blank')
    }
  }, [source, getSourceUrl])

  const Icon = getSourceIcon(source)

  return (
    <div 
      className={cn(
        "text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-150",
        getSourceUrl(source) && "cursor-pointer"
      )}
      onClick={getSourceUrl(source) ? handleSourceClick : undefined}
      role={getSourceUrl(source) ? "button" : undefined}
      tabIndex={getSourceUrl(source) ? 0 : undefined}
      onKeyDown={(e) => {
        if (getSourceUrl(source) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleSourceClick()
        }
      }}
    >
      <div className="flex items-start space-x-2">
        <Icon className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {source.title || source.filename || source.name || `Source ${index + 1}`}
          </div>
          
          {/* Show additional metadata */}
          <div className="flex flex-wrap gap-2 mt-1 text-blue-600">
            {source.page && (
              <span className="text-xs">Page {source.page}</span>
            )}
            {source.section && (
              <span className="text-xs">§ {source.section}</span>
            )}
            {source.framework && (
              <span className="text-xs bg-blue-100 px-1 rounded">{source.framework}</span>
            )}
            {source.type && (
              <span className="text-xs bg-blue-100 px-1 rounded">{source.type}</span>
            )}
          </div>

          {/* Show description or excerpt if available */}
          {source.description && (
            <div className="text-blue-600 text-xs mt-1 line-clamp-2">
              {source.description}
            </div>
          )}
          
          {/* Show excerpt if available */}
          {source.excerpt && (
            <div className="text-blue-600 text-xs mt-1 italic line-clamp-2">
              "{source.excerpt}"
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-1">
          {getSourceUrl(source) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation()
                handleSourceClick()
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          
          {source.downloadUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation()
                window.open(source.downloadUrl, '_blank')
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

const ChatBubble = memo(({ message, onGeneratePolicy }: ChatBubbleProps) => {
  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-4xl rounded-xl px-6 py-5 ${
          isUser 
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg" 
            : "bg-white border border-gray-200 text-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200"
        }`}
      >
        <div className="text-sm leading-relaxed">
          {isUser ? (
            // Simple formatting for user messages
            <div className="whitespace-pre-wrap text-blue-100">
              {message.content}
            </div>
          ) : (
            // Rich markdown formatting for assistant messages
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Show confidence score for assistant messages */}
        {!isUser && message.confidence_score && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Confidence: {(message.confidence_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Show sources if available */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-3 flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              Sources & References
            </div>
            <div className="space-y-2">
              {message.sources.map((source: Source, index: number) => (
                <SourceCard key={index} source={source} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Show clause references if available */}
        {!isUser && message.clause_references && message.clause_references.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-3">Related Clauses</div>
            <div className="flex flex-wrap gap-2">
              {message.clause_references.map((clause: string, index: number) => (
                <span key={index} className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-medium hover:bg-amber-100 cursor-pointer transition-colors">
                  {clause}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Show control IDs if available */}
        {!isUser && message.control_ids && message.control_ids.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-600 mb-3">Control IDs</div>
            <div className="flex flex-wrap gap-2">
              {message.control_ids.map((controlId: string, index: number) => (
                <span key={index} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200 font-medium hover:bg-purple-100 cursor-pointer transition-colors">
                  {controlId}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={`text-xs mt-4 ${isUser ? "text-blue-100" : "text-gray-400"} flex items-center justify-between`}>
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {!isUser && (
            <span className="italic">CompliAI Assistant</span>
          )}
        </div>
      </div>
    </div>
  )
})

ChatBubble.displayName = "ChatBubble"

export default ChatBubble
