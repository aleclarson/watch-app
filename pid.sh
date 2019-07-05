ps x -o pid,args |     # List all processes
  grep -i " $1" |      # Find processes whose args contain the application path
  grep -v "grep" |     # Ignore "grep" processes
  grep -v "$$ " |      # Ignore this process
  grep -v "$PPID " |   # Ignore the parent of this process
  awk '{ print $1 }'   # Print the process ID (or nothing)
