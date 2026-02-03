// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MockERC721 is IERC721 {
    string public name;
    string public symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function balanceOf(address owner) external view override returns (uint256) {
        require(owner != address(0), "Invalid owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Invalid token");
        return owner;
    }

    function approve(address to, uint256 tokenId) external override {
        address owner = _owners[tokenId];
        require(msg.sender == owner || _operatorApprovals[owner][msg.sender], "Not approved");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view override returns (address) {
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external override {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) external view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC721).interfaceId;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        address owner = _owners[tokenId];
        require(owner == from, "Not owner");
        require(to != address(0), "Invalid to");
        require(
            msg.sender == owner ||
            _tokenApprovals[tokenId] == msg.sender ||
            _operatorApprovals[owner][msg.sender],
            "Not approved"
        );
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        delete _tokenApprovals[tokenId];
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external override {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external override {
        data;
        transferFrom(from, to, tokenId);
    }

    function mint(address to, uint256 tokenId) external {
        require(to != address(0), "Invalid to");
        require(_owners[tokenId] == address(0), "Already minted");
        _owners[tokenId] = to;
        _balances[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }
}
