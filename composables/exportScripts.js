export const escapedCode = `// script modified and adapted from https://gist.github.com/8bitgentleman/de939b391d5d27ee310a0912b2ccba85
(() => {
  if (
    !location.href.startsWith("https://twitter.com/i/bookmarks") &&
    !location.href.startsWith("https://x.com/i/bookmarks")
  ) {
    console.log(location.href);
    alert(
      "This bookmarklet should only be used on your twitter bookmarks page."
    );
    return;
  }
  // Save the original XMLHttpRequest object
  var originalXHR = window.XMLHttpRequest;
  var hasProcessLikesBeenCalled = false; // Flag variable

  // Define a new XMLHttpRequest
  function newXHR() {
    var realXHR = new originalXHR();
    var requestHeaders = {};
    // Override setRequestHeader to capture request headers
    var originalSetRequestHeader = realXHR.setRequestHeader;
    realXHR.setRequestHeader = function (header, value) {
      requestHeaders[header] = value;
      originalSetRequestHeader.call(realXHR, header, value);
    };

    // Override open to store the request URL
    var originalOpen = realXHR.open;
    realXHR.open = function (method, url) {
      realXHR.requestURL = url;
      return originalOpen.apply(realXHR, arguments);
    };

    // Override send to log the request with headers
    const originalSend = realXHR.send;
    realXHR.send = function (body) {
      realXHR.addEventListener("readystatechange", function () {
        if (!hasProcessLikesBeenCalled) {
          if (realXHR.readyState === 4) {
            const clientEventPattern =
              /^(https:\\/\\/(twitter\\.com|x\\.com)\\/i\\/api\\/.*\\/client_event\\.json)$/;
            const bookmarksPattern =
              /^https:\\/\\/(twitter\\.com|x\\.com)\\/i\\/api\\/graphql\\/.*\\/Bookmarks.*/;
            if (
              clientEventPattern.test(realXHR.requestURL) ||
              bookmarksPattern.test(realXHR.requestURL)
            ) {
              const x_csrf_token = requestHeaders["x-csrf-token"];
              const authorization_token = requestHeaders["authorization"];

              // NOTE: extracting twitter profile id not necessary for bookmarks
              //   let profileId;
              //   if (clientEventPattern.test(realXHR.requestURL)) {
              //     console.log("INTERCEPTED CLIENT EVENT");
              //     // Decoding the URL-encoded 'log' parameter
              //     const decodedLog = decodeURIComponent(
              //       body.split("log=")[1].split("&")[0]
              //     );
              //     // Extract the user's profile_id from client_event.json's log param
              //     const logObject = JSON.parse(decodedLog);
              //     profileId = logObject[0].profile_id;
              //   } else if (bookmarksPattern.test(realXHR.requestURL)) {
              //     console.log("INTERCEPTED BOOKMARKS API CALL");
              //     // Extract the user's profile_id from the URL's query params
              //     const decodedVariables = decodeURIComponent(
              //       realXHR.requestURL.split("Likes?variables=")[1].split("&")[0]
              //     );
              //     const variablesObject = JSON.parse(decodedVariables);

              //     profileId = variablesObject.userId;
              //   }
              if (x_csrf_token && authorization_token) {
                console.log("%cExtracted tokens:", "font-weight: bold");
                console.log(
                  "%cx-csrf-token: %c" + x_csrf_token,
                  "font-weight: bold",
                  "font-weight: normal"
                );
                console.log(
                  "%cauthorization: %c" + authorization_token,
                  "font-weight: bold",
                  "font-weight: normal"
                );

                console.log("Credentials gathered... Processing likes");
                hasProcessLikesBeenCalled = true;
                processLikes(x_csrf_token, authorization_token);
              } else {
                console.log("Missing credentials. Continuing to intercept...");
              }
            }
          }
        }
      });

      return originalSend.apply(realXHR, arguments);
    };

    return realXHR;
  }

  // Replace the native XMLHttpRequest with the modified one
  window.XMLHttpRequest = newXHR;

  console.log(
    "Network request interception with request headers logging is now active for XMLHttpRequest."
  );
  // Scroll the window to trigger a client_event request or Likes API call
  function scrollWindow() {
    window.scrollBy(0, window.innerHeight);
    if (hasProcessLikesBeenCalled) {
      clearInterval(scrollInterval);
    }
  }
  let scrollInterval = setInterval(scrollWindow, 500);

  function parseTweetsFromJsonAPIResponse(apiResponse) {
    // function constructTweetObject(tweetData, userData, quotedTweetData) {
    function constructTweetObject(entryResult, userData, quotedTweetData) {
      console.log(
        "entryResult",
        entryResult,
        "tweetDataLegacy",
        entryResult.legacy,
        "userData",
        userData,
        "quotedTweetData",
        quotedTweetData
      );

      try {
        const tweetData = entryResult.legacy;
        let fullText = tweetData.full_text;
        if (entryResult.note_tweet) {
          // extract full text from note_tweet property if the tweet is long and its text is truncated. The note_tweet property only exists for expandable long tweets
          fullText = entryResult.note_tweet.note_tweet_results.result.text;
        }
        const mediaEntities =
          tweetData.extended_entities?.media ?? tweetData.entities.media;
        let quoteStatus = null;

        if (quotedTweetData) {
          const quotedTweetResult =
            quotedTweetData.result.tweet ?? quotedTweetData.result;
          if (
            quotedTweetResult.legacy &&
            quotedTweetResult.core?.user_results?.result?.legacy
          ) {
            const userLegacyData =
              quotedTweetResult.core.user_results.result.legacy;
            userLegacyData.id_str =
              quotedTweetResult.core.user_results.result.rest_id;
            quoteStatus = constructTweetObject(
              // legacyData.legacy,
              quotedTweetResult,
              userLegacyData,
              null
            );
          }
        }

        return {
          id: tweetData.id_str,
          // conversation_id: tweetData.conversation_id_str,
          date: new Date(tweetData.created_at).toISOString(),
          text: fullText,
          url: \`https://twitter.com/\${userData.screen_name}/status/\${tweetData.id_str}\`,
          // reply_count: tweetData.reply_count,
          // retweet_count: tweetData.retweet_count,
          // is_self_thread: Boolean(tweetData.self_thread),
          user: {
            id: userData.id_str,
            name: userData.name,
            handle: userData.screen_name,
            profilePicUrl: userData.profile_image_url_https,
            verified: userData.verified ?? false,
          },
          media: mediaEntities
            ? mediaEntities.map((media) => ({
                type: media.type,
                url: media.media_url_https,
                // media_url: media.expanded_url,
                video_src:
                  media.type === "video" || media.type === "animated_gif"
                    ? media.video_info.variants
                    : undefined,
              }))
            : [],
          quote_status: quoteStatus,
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    let parsedTweets = [];
    const entries =
      apiResponse.data.bookmark_timeline_v2.timeline.instructions[0].entries;

    entries.forEach((item) => {
      // don't process cursor entries
      if (item.content.entryType === "TimelineTimelineItem") {
        const entryResult = item.content.itemContent.tweet_results.result;
        const tweetLegacy = entryResult.legacy;
        // check if tweet is underfined. This happens when tweet is deleted or removed (will show up as 'This post is unavailable' in timeline)
        if (tweetLegacy === undefined) {
          console.log(
            "Tweet object undefined. It was probably deleted or removed: ",
            item.content
          );
          return;
        }
        if (
          entryResult.__typename === "Tweet" &&
          entryResult.core?.user_results?.result?.legacy
        ) {
          let quotedTweet = null;
          let user = entryResult.core.user_results.result.legacy;
          user.id_str = entryResult.core.user_results.result.rest_id;

          if (tweetLegacy.is_quote_status) {
            quotedTweet = entryResult.quoted_status_result;
            // We check if quotedTweet is an empty object to catch cases where the quoted tweet was deleted
            if (Object.keys(quotedTweet).length === 0) {
              quotedTweet = null;
            }
          }

          const tweetObject = constructTweetObject(
            // tweetLegacy,
            entryResult,
            user,
            quotedTweet
          );
          parsedTweets.push(tweetObject);
        }
      }
    });

    return parsedTweets;
  }

  async function fetchWithCredentials(
    url,
    options = {},
    x_csrf_token,
    authorization_token
  ) {
    const defaultHeaders = {
      "x-csrf-token": x_csrf_token,
      authorization: authorization_token,
    };

    if (!defaultHeaders["x-csrf-token"] || !defaultHeaders.authorization) {
      throw new Error("Missing credentials");
    }

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
      },
      referrerPolicy: "no-referrer-when-downgrade",
      body: null,
      ...options,
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    } else if (response.status !== 200) {
      throw new Error("Error " + response.status);
    }

    if (response.errors) {
      throw new Error(response.errors?.[0]?.message);
    }

    return await response.json();
  }

  async function processLikes(x_csrf_token, authorization_token) {
    const TWEETS_PER_REQUEST = 100;
    let tweets = [];
    let cursorBottom = "";
    let cursorTop = "";
    let bookmarksUrl =
      "https://x.com/i/api/graphql/uNowfj04D8HFVFMbjm6xrQ/Bookmarks?variables=%7B%22count%22%3A20%2C%22cursor%22%3A%22HBa6pICx7qWs4zEAAA%3D%3D%22%2C%22includePromotedContent%22%3Atrue%7D&features=%7B%22graphql_timeline_v2_bookmark_timeline%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D";
    bookmarksUrl = bookmarksUrl
      .replace(/%22cursor.*?%2C/, "")
      .replace(/count.*?%2C/, \`count%22%3A\${TWEETS_PER_REQUEST}%2C\`);

    do {
      if (cursorBottom) {
        // matches "cursor" followed by any characters up to the next comma
        bookmarksUrl = bookmarksUrl.includes("cursor")
          ? bookmarksUrl.replace(
              /cursor.*?%2C/,
              encodeURIComponent(\`cursor":"\${cursorBottom}",\`)
            )
          : // matches "variables={"
            bookmarksUrl.replace(
              /variables=%7B/,
              "variables=" + encodeURIComponent(\`{"cursor":"\${cursorBottom}",\`)
            );
      }

      try {
        const response = await fetchWithCredentials(
          bookmarksUrl,
          {},
          x_csrf_token,
          authorization_token
        );
        tweets = tweets.concat(parseTweetsFromJsonAPIResponse(response));

        const cursorEntry =
          response.data.bookmark_timeline_v2.timeline.instructions[0].entries.find(
            (entry) => entry.entryId.startsWith("cursor-bottom-")
          );

        if (cursorEntry) {
          cursorTop = cursorBottom;
          cursorBottom = cursorEntry.content.value ?? null;
          console.log(\`cursorTop: \${cursorTop}, cursorBottom: \${cursorBottom}\`);
        }
      } catch (error) {
        console.error(error);
        break;
      }
    } while (cursorBottom && cursorTop !== cursorBottom);

    console.log("Bookmarks processed:", tweets.length);
    // const tweetsJson = JSON.stringify(tweets, null, 2);
    const version = 1.02;
    const tweetsData = {
      version: version,
      data: tweets,
    };
    const tweetsJson = JSON.stringify(tweetsData, null, 2); // Convert the array to JSON

    const blob = new Blob([tweetsJson], { type: "application/json" });
    const dataUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = "bookmarks.json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log("Download complete");
  }
})();
`;

export const bookmarkletCode = encodeURI(`javascript:(function(){// script modified and adapted from https://gist.github.com/8bitgentleman/de939b391d5d27ee310a0912b2ccba85
(() => {
  if (
    !location.href.startsWith("https://twitter.com/i/bookmarks") &&
    !location.href.startsWith("https://x.com/i/bookmarks")
  ) {
    console.log(location.href);
    alert(
      "This bookmarklet should only be used on your twitter bookmarks page."
    );
    return;
  }
  // Save the original XMLHttpRequest object
  var originalXHR = window.XMLHttpRequest;
  var hasProcessLikesBeenCalled = false; // Flag variable

  // Define a new XMLHttpRequest
  function newXHR() {
    var realXHR = new originalXHR();
    var requestHeaders = {};
    // Override setRequestHeader to capture request headers
    var originalSetRequestHeader = realXHR.setRequestHeader;
    realXHR.setRequestHeader = function (header, value) {
      requestHeaders[header] = value;
      originalSetRequestHeader.call(realXHR, header, value);
    };

    // Override open to store the request URL
    var originalOpen = realXHR.open;
    realXHR.open = function (method, url) {
      realXHR.requestURL = url;
      return originalOpen.apply(realXHR, arguments);
    };

    // Override send to log the request with headers
    const originalSend = realXHR.send;
    realXHR.send = function (body) {
      realXHR.addEventListener("readystatechange", function () {
        if (!hasProcessLikesBeenCalled) {
          if (realXHR.readyState === 4) {
            const clientEventPattern =
              /^(https:\\/\\/(twitter\\.com|x\\.com)\\/i\\/api\\/.*\\/client_event\\.json)$/;
            const bookmarksPattern =
              /^https:\\/\\/(twitter\\.com|x\\.com)\\/i\\/api\\/graphql\\/.*\\/Bookmarks.*/;
            if (
              clientEventPattern.test(realXHR.requestURL) ||
              bookmarksPattern.test(realXHR.requestURL)
            ) {
              const x_csrf_token = requestHeaders["x-csrf-token"];
              const authorization_token = requestHeaders["authorization"];

              // NOTE: extracting twitter profile id not necessary for bookmarks
              //   let profileId;
              //   if (clientEventPattern.test(realXHR.requestURL)) {
              //     console.log("INTERCEPTED CLIENT EVENT");
              //     // Decoding the URL-encoded 'log' parameter
              //     const decodedLog = decodeURIComponent(
              //       body.split("log=")[1].split("&")[0]
              //     );
              //     // Extract the user's profile_id from client_event.json's log param
              //     const logObject = JSON.parse(decodedLog);
              //     profileId = logObject[0].profile_id;
              //   } else if (bookmarksPattern.test(realXHR.requestURL)) {
              //     console.log("INTERCEPTED BOOKMARKS API CALL");
              //     // Extract the user's profile_id from the URL's query params
              //     const decodedVariables = decodeURIComponent(
              //       realXHR.requestURL.split("Likes?variables=")[1].split("&")[0]
              //     );
              //     const variablesObject = JSON.parse(decodedVariables);

              //     profileId = variablesObject.userId;
              //   }
              if (x_csrf_token && authorization_token) {
                console.log("%cExtracted tokens:", "font-weight: bold");
                console.log(
                  "%cx-csrf-token: %c" + x_csrf_token,
                  "font-weight: bold",
                  "font-weight: normal"
                );
                console.log(
                  "%cauthorization: %c" + authorization_token,
                  "font-weight: bold",
                  "font-weight: normal"
                );

                console.log("Credentials gathered... Processing likes");
                hasProcessLikesBeenCalled = true;
                processLikes(x_csrf_token, authorization_token);
              } else {
                console.log("Missing credentials. Continuing to intercept...");
              }
            }
          }
        }
      });

      return originalSend.apply(realXHR, arguments);
    };

    return realXHR;
  }

  // Replace the native XMLHttpRequest with the modified one
  window.XMLHttpRequest = newXHR;

  console.log(
    "Network request interception with request headers logging is now active for XMLHttpRequest."
  );
  // Scroll the window to trigger a client_event request or Likes API call
  function scrollWindow() {
    window.scrollBy(0, window.innerHeight);
    if (hasProcessLikesBeenCalled) {
      clearInterval(scrollInterval);
    }
  }
  let scrollInterval = setInterval(scrollWindow, 500);

  function parseTweetsFromJsonAPIResponse(apiResponse) {
    // function constructTweetObject(tweetData, userData, quotedTweetData) {
    function constructTweetObject(entryResult, userData, quotedTweetData) {
      console.log(
        "entryResult",
        entryResult,
        "tweetDataLegacy",
        entryResult.legacy,
        "userData",
        userData,
        "quotedTweetData",
        quotedTweetData
      );

      try {
        const tweetData = entryResult.legacy;
        let fullText = tweetData.full_text;
        if (entryResult.note_tweet) {
          // extract full text from note_tweet property if the tweet is long and its text is truncated. The note_tweet property only exists for expandable long tweets
          fullText = entryResult.note_tweet.note_tweet_results.result.text;
        }
        const mediaEntities =
          tweetData.extended_entities?.media ?? tweetData.entities.media;
        let quoteStatus = null;

        if (quotedTweetData) {
          const quotedTweetResult =
            quotedTweetData.result.tweet ?? quotedTweetData.result;
          if (
            quotedTweetResult.legacy &&
            quotedTweetResult.core?.user_results?.result?.legacy
          ) {
            const userLegacyData =
              quotedTweetResult.core.user_results.result.legacy;
            userLegacyData.id_str =
              quotedTweetResult.core.user_results.result.rest_id;
            quoteStatus = constructTweetObject(
              // legacyData.legacy,
              quotedTweetResult,
              userLegacyData,
              null
            );
          }
        }

        return {
          id: tweetData.id_str,
          // conversation_id: tweetData.conversation_id_str,
          date: new Date(tweetData.created_at).toISOString(),
          text: fullText,
          url: \`https://twitter.com/\${userData.screen_name}/status/\${tweetData.id_str}\`,
          // reply_count: tweetData.reply_count,
          // retweet_count: tweetData.retweet_count,
          // is_self_thread: Boolean(tweetData.self_thread),
          user: {
            id: userData.id_str,
            name: userData.name,
            handle: userData.screen_name,
            profilePicUrl: userData.profile_image_url_https,
            verified: userData.verified ?? false,
          },
          media: mediaEntities
            ? mediaEntities.map((media) => ({
                type: media.type,
                url: media.media_url_https,
                // media_url: media.expanded_url,
                video_src:
                  media.type === "video" || media.type === "animated_gif"
                    ? media.video_info.variants
                    : undefined,
              }))
            : [],
          quote_status: quoteStatus,
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    let parsedTweets = [];
    const entries =
      apiResponse.data.bookmark_timeline_v2.timeline.instructions[0].entries;

    entries.forEach((item) => {
      // don't process cursor entries
      if (item.content.entryType === "TimelineTimelineItem") {
        const entryResult = item.content.itemContent.tweet_results.result;
        const tweetLegacy = entryResult.legacy;
        // check if tweet is underfined. This happens when tweet is deleted or removed (will show up as 'This post is unavailable' in timeline)
        if (tweetLegacy === undefined) {
          console.log(
            "Tweet object undefined. It was probably deleted or removed: ",
            item.content
          );
          return;
        }
        if (
          entryResult.__typename === "Tweet" &&
          entryResult.core?.user_results?.result?.legacy
        ) {
          let quotedTweet = null;
          let user = entryResult.core.user_results.result.legacy;
          user.id_str = entryResult.core.user_results.result.rest_id;

          if (tweetLegacy.is_quote_status) {
            quotedTweet = entryResult.quoted_status_result;
            // We check if quotedTweet is an empty object to catch cases where the quoted tweet was deleted
            if (Object.keys(quotedTweet).length === 0) {
              quotedTweet = null;
            }
          }

          const tweetObject = constructTweetObject(
            // tweetLegacy,
            entryResult,
            user,
            quotedTweet
          );
          parsedTweets.push(tweetObject);
        }
      }
    });

    return parsedTweets;
  }

  async function fetchWithCredentials(
    url,
    options = {},
    x_csrf_token,
    authorization_token
  ) {
    const defaultHeaders = {
      "x-csrf-token": x_csrf_token,
      authorization: authorization_token,
    };

    if (!defaultHeaders["x-csrf-token"] || !defaultHeaders.authorization) {
      throw new Error("Missing credentials");
    }

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
      },
      referrerPolicy: "no-referrer-when-downgrade",
      body: null,
      ...options,
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    } else if (response.status !== 200) {
      throw new Error("Error " + response.status);
    }

    if (response.errors) {
      throw new Error(response.errors?.[0]?.message);
    }

    return await response.json();
  }

  async function processLikes(x_csrf_token, authorization_token) {
    const TWEETS_PER_REQUEST = 100;
    let tweets = [];
    let cursorBottom = "";
    let cursorTop = "";
    let bookmarksUrl =
      "https://x.com/i/api/graphql/uNowfj04D8HFVFMbjm6xrQ/Bookmarks?variables=%7B%22count%22%3A20%2C%22cursor%22%3A%22HBa6pICx7qWs4zEAAA%3D%3D%22%2C%22includePromotedContent%22%3Atrue%7D&features=%7B%22graphql_timeline_v2_bookmark_timeline%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D";
    bookmarksUrl = bookmarksUrl
      .replace(/%22cursor.*?%2C/, "")
      .replace(/count.*?%2C/, \`count%22%3A\${TWEETS_PER_REQUEST}%2C\`);

    do {
      if (cursorBottom) {
        // matches "cursor" followed by any characters up to the next comma
        bookmarksUrl = bookmarksUrl.includes("cursor")
          ? bookmarksUrl.replace(
              /cursor.*?%2C/,
              encodeURIComponent(\`cursor":"\${cursorBottom}",\`)
            )
          : // matches "variables={"
            bookmarksUrl.replace(
              /variables=%7B/,
              "variables=" + encodeURIComponent(\`{"cursor":"\${cursorBottom}",\`)
            );
      }

      try {
        const response = await fetchWithCredentials(
          bookmarksUrl,
          {},
          x_csrf_token,
          authorization_token
        );
        tweets = tweets.concat(parseTweetsFromJsonAPIResponse(response));

        const cursorEntry =
          response.data.bookmark_timeline_v2.timeline.instructions[0].entries.find(
            (entry) => entry.entryId.startsWith("cursor-bottom-")
          );

        if (cursorEntry) {
          cursorTop = cursorBottom;
          cursorBottom = cursorEntry.content.value ?? null;
          console.log(\`cursorTop: \${cursorTop}, cursorBottom: \${cursorBottom}\`);
        }
      } catch (error) {
        console.error(error);
        break;
      }
    } while (cursorBottom && cursorTop !== cursorBottom);

    console.log("Bookmarks processed:", tweets.length);
    // const tweetsJson = JSON.stringify(tweets, null, 2);
    const version = 1.02;
    const tweetsData = {
      version: version,
      data: tweets,
    };
    const tweetsJson = JSON.stringify(tweetsData, null, 2); // Convert the array to JSON

    const blob = new Blob([tweetsJson], { type: "application/json" });
    const dataUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = "bookmarks.json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log("Download complete");
  }
})();
})();`);