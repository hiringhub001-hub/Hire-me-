'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true, // Automatically tracks page views safely in Next.js

        session_recording: {
        maskAllInputs: true,
                // maskTextSelector: '*', // This masks ALL text across the entire website
        maskTextSelector: '[data-sensitive]',

// means PostHog will mask things users type into inputs.

// So things like:

// passwords

// email addresses

// phone numbers

// application answers

// won't be exposed in the recording as readable input values.

// Then this:

      },

    })
  }, [])

  return <PostHogProvider client={posthog}>{children}
  </PostHogProvider>
}

   