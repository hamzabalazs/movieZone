import { Box, Fade, useScrollTrigger } from "@mui/material";

export interface ScrollBackProps {
  window?: () => Window;
  children: React.ReactElement;
}

export default function ScrollTop(props: ScrollBackProps) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector("#back-to-top-anchor");

    if (anchor) {
      anchor.scrollIntoView({
        block: "center",
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        data-testid="scrolltop"
      >
        {children}
      </Box>
    </Fade>
  );
}
