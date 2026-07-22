const fs = require('fs');

let code = fs.readFileSync('src/hooks/useNotifications.js', 'utf8');

// 1. Withdrawal Pending
code = code.replace(
    `            isUnread: tDate.getTime() > lastReadTime
          });
        }
      });

      myCompOffs.forEach`,
    `            isUnread: tDate.getTime() > lastReadTime,
            link: '/leaves'
          });
        }
      });

      myCompOffs.forEach`
);

// 2. Comp-Off Granted
code = code.replace(
    `            isUnread: tDate.getTime() > lastReadTime
        });
      });
    }`,
    `            isUnread: tDate.getTime() > lastReadTime,
            link: '/my-comp-offs'
        });
      });
    }`
);

// 3. Welcome Notification
code = code.replace(
    `      isUnread: false
    });

    // Sort by newest first`,
    `      isUnread: false,
      link: '/profile'
    });

    // Sort by newest first`
);

fs.writeFileSync('src/hooks/useNotifications.js', code);
console.log("Fixed useNotifications.js");
