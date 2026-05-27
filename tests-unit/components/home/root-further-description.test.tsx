import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RootFurtherDescription } from "@/app/_components/home/root-further-description";

describe("<RootFurtherDescription />", () => {
  it("renders the ROOT FURTHER logo image", () => {
    render(<RootFurtherDescription />);
    expect(screen.getByAltText("ROOT FURTHER")).toBeInTheDocument();
  });

  it("renders the pull-quote heading", () => {
    render(<RootFurtherDescription />);
    expect(
      screen.getByText(/A tree with deep roots fears no storm/)
    ).toBeInTheDocument();
  });

  it("renders the pull-quote attribution", () => {
    render(<RootFurtherDescription />);
    expect(
      screen.getByText(/Cây sâu bén rễ, bão giông chẳng nề/)
    ).toBeInTheDocument();
  });

  it("renders the first body paragraph (AI era context)", () => {
    render(<RootFurtherDescription />);
    expect(
      screen.getByText(/bối cảnh thay đổi như vũ bão của thời đại AI/)
    ).toBeInTheDocument();
  });

  it("renders the 'Root Further' theme paragraph", () => {
    render(<RootFurtherDescription />);
    expect(
      screen.getByText(/Root Further.*đã được chọn để trở thành chủ đề/)
    ).toBeInTheDocument();
  });

  it("renders the closing paragraph", () => {
    render(<RootFurtherDescription />);
    expect(
      screen.getByText(/tinh thần cội rễ/)
    ).toBeInTheDocument();
  });
});
